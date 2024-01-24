import { Machine } from '../Common/Machine';
import { Opcodes } from '../Common/Opcodes';
import { Code } from '../Common/Code';

import { ReorderBuffer } from "./ReorderBuffer";
import { PrefetchUnit } from './PrefetchUnit';
import { ReserveStation } from './ReserveStation';
import { FunctionalUnit, FunctionalUnitType, FUNCTIONALUNITTYPESQUANTITY } from '../Common/FunctionalUnit';
import { JumpPredictor } from './JumpPredictor';
import { Instruction } from '../Common/Instruction';
import { CommitStatus, SuperStage, SuperescalarStatus } from './SuperescalarEnums';

export class Superescalar extends Machine {

    private static PREDTABLEBITS = 4;
    private static PREDTABLESIZE = 1 << Superescalar.PREDTABLEBITS;

    private static ISSUE_DEF = 4;

    private _issue: number;
    private _code: Code;

    private _reserveStations: Map<FunctionalUnitType, ReserveStation>;
    private _reorderBuffer: ReorderBuffer;
    private _prefetchUnit: PrefetchUnit;
    private _decoder: PrefetchUnit;
    private _aluMem: FunctionalUnit[];

    private _jumpPrediction: JumpPredictor;

    constructor() {
        super();
        this.issue = Superescalar.ISSUE_DEF;

        this._jumpPrediction = new JumpPredictor(Superescalar.PREDTABLESIZE);
        this._reserveStations = new Map<FunctionalUnitType, ReserveStation>();
        let total = 0; //  total ROB size
        for (let i = 0; i < FUNCTIONALUNITTYPESQUANTITY; i++) {
            let size = this.getReserveStationSize(i);
            this._reserveStations[i] = new ReserveStation(size);
            total += size;
        }
        this._reorderBuffer = new ReorderBuffer(total);
        this._prefetchUnit = new PrefetchUnit(this.issue * 2);
        this._decoder = new PrefetchUnit(this.issue);

        this._code = null;

        this.aluMem = new Array(this.functionalUnitNumbers[FunctionalUnitType.MEMORY]);

        for (let j = 0; j < this.functionalUnitNumbers[FunctionalUnitType.MEMORY]; j++) {
            this.aluMem[j] = new FunctionalUnit();
            this.aluMem[j].type = FunctionalUnitType.INTEGERSUM;
            this.aluMem[j].latency = this.functionalUnitLatencies[FunctionalUnitType.INTEGERSUM];
        }
    }

    init(reset: boolean) {
        super.init(reset);
        // Clean Gpr, Fpr, predSalto
        this._jumpPrediction.clean();

        for (let i = 0; i < FUNCTIONALUNITTYPESQUANTITY; i++) {
            this._reserveStations[i].clear();
        }
        this._reorderBuffer.clear();
        this._decoder.clean();
        this._prefetchUnit.clean();
        this._code = null;

        this.aluMem = new Array(this.functionalUnitNumbers[FunctionalUnitType.MEMORY]).fill(new FunctionalUnit());

        for (let j = 0; j < this.functionalUnitNumbers[FunctionalUnitType.MEMORY]; j++) {
            this.aluMem[j] = new FunctionalUnit();
            this.aluMem[j].type = FunctionalUnitType.INTEGERSUM;
            this.aluMem[j].latency = this.functionalUnitLatencies[FunctionalUnitType.INTEGERSUM];
        }
    }

    ticPrefetch(): boolean {
        while ((!this._prefetchUnit.isFull()) && (this.pc < this.code.lines)) {
            // Importante: Hago una copia de la instrucción original para distinguir
            // las distintas apariciones de una misma inst.
            let instruction = new Instruction();
            instruction.copy(this.code.instructions[this.pc]);
            if ((instruction.isJumpInstruction() && this._jumpPrediction.getPrediction(this.pc))) {
                //this.pc = this.code.getBasicBlockInstruction(aux.instruction.getOperand(2));
                // The new parser just put the line number instead of the basic block, it is more simple
                this.pc = instruction.getOperand(2);
            } else {
                this.pc++;
            }
            this._prefetchUnit.add(instruction);
        }
        return this._prefetchUnit.isEmpty();
    }

    public getReserveStationSize(type: FunctionalUnitType): number {
        return this.functionalUnitNumbers[type] * (this._functionalUnitLatencies[type] + 1);
    }

    ticDecoder(): boolean {
        while (!this._decoder.isFull() && !this._prefetchUnit.isEmpty()) {
            let instruction = this._prefetchUnit.get();
            this._decoder.add(instruction);
        }
        return this._decoder.isEmpty();
    }

    getRegisterValueOrROBRef(register: number, floatingPoint: boolean): [number, boolean] {
        let isROBRef = false;
        let result = 0; // Value or Rob index

        // Check if the value is available in the register file or ROB
        if (floatingPoint && !this._fpr.busy[register]) {
            result = this._fpr.content[register];
        } else if (!floatingPoint && !this._gpr.busy[register]) {
            result = this._gpr.content[register];
        } else if (this._reorderBuffer.isRegisterValueReady(register, floatingPoint)) {
            result = this._reorderBuffer.getRegisterValue(register, floatingPoint);
        } else {
            // The value is still being calculated
            isROBRef = true;
            result = this._reorderBuffer.getRegisterMapping(register, floatingPoint);
        }


        return [result, isROBRef];
    }

    issueInstructionToReserveStation(instruction: Instruction, type: number): number {
        let instrRef = this._reserveStations[type].issueInstruction(instruction);

        // check were the value of the first operand is
        let firstOperandReg = instruction.getFirstOperandRegister();
        if (firstOperandReg !== -1) {
            let [value, isROBRef] = this.getRegisterValueOrROBRef(firstOperandReg, instruction.isFirstOperandFloat());
            if (isROBRef) {
                this._reserveStations[type].setFirstOperandReference(instrRef, value);
            } else {
                this._reserveStations[type].setFirstOperandValue(instrRef, value);
            }
        } else if (instruction.hasImmediateOperand()) {
            // move the value of the immediate to the reserve station, if it has one
            this._reserveStations[type].setFirstOperandValue(instrRef, instruction.getImmediateOperand());
        } else {
            // set the value of the first operand to 0
            this._reserveStations[type].setFirstOperandValue(instrRef, 0);
        }

        // check were the value of the second operand is
        let secondOperandReg = instruction.getSecondOperandRegister();
        if (secondOperandReg !== -1) {
            let [value, isROBRef] = this.getRegisterValueOrROBRef(secondOperandReg, instruction.isSecondOperandFloat());
            if (isROBRef) {
                this._reserveStations[type].setSecondOperandReference(instrRef, value);
            } else {
                this._reserveStations[type].setSecondOperandValue(instrRef, value);
            }
        } else if (instruction.hasImmediateOperand()) {
            // move the value of the immediate to the reserve station, if it has one
            this._reserveStations[type].setSecondOperandValue(instrRef, instruction.getImmediateOperand());
        } else {
            // set the value of the second operand to 0
            this._reserveStations[type].setSecondOperandValue(instrRef, 0);
        }

        // move the value of the address to the reserve station, if it has one
        if (instruction.getAddressOperand() !== -1) {
            this._reserveStations[type].setAddressOperand(instrRef, instruction.getAddressOperand());
        }

        // set the destination register as busy, if it has one
        if (instruction.getDestinyRegister() !== -1) {
            if (instruction.isDestinyRegisterFloat()) {
                this._fpr.setBusy(instruction.getDestinyRegister(), true);
            } else {
                this._gpr.setBusy(instruction.getDestinyRegister(), true);
            }
        }

        return instrRef;
    }

    ticIssue(): number {
        let i = 0;

        while (!this._decoder.isEmpty()) {
            let fuType: FunctionalUnitType = this.code.getFunctionalUnitType(this._decoder.getId());

            // Check if there is space in the reorder buffer and the reserve station
            if (this._reorderBuffer.isFull()) {
                break;
            }
            if (this._reserveStations[fuType].isFull()) {
                break;
            }

            let instruction: Instruction = this._decoder.get();
            let reserveStationPos = this.issueInstructionToReserveStation(instruction, fuType);
            // This is a hack, because putting the instruction in the reorder buffer before that in the reserve station will cause a circular dependency on instructions that reads and writes the same register, but the reserve station entry needs the rob index
            let robPos = this._reorderBuffer.issueInstruction(instruction);
            this._reserveStations[fuType].setROBReference(reserveStationPos, robPos);

            i++;
        }

        return i;
    }

    executeInstruction(type: FunctionalUnitType, num: number) {
        let readyInstsRefs = this._reserveStations[type].getReadyInstructions();
        for (let instrRef of readyInstsRefs) {
            let instrROBRef = this._reserveStations[type].getROBReference(instrRef);
            let instruction = this._reorderBuffer.getInstruction(instrROBRef);

            // Check if the instruction is a store and skip it
            // TODO: dont do this?
            if (instruction.isStoreInstruction()) {
                continue;
            }

            // if it is a load check that is really ready
            // this is because the load can be ready but the memory address is not calculated yet
            // or there is an store pending on that address
            if (instruction.isLoadInstruction()) {
                if (!this._reorderBuffer.hasResultAddress(instrROBRef)) {
                    continue;
                }
                if (this._reorderBuffer.hasPreviousStores(instrROBRef)) {
                    continue;
                }
            }

            // move the instruction to the functional unit,
            // associate it with the reserve station entry 
            // and set the instruction as executing in the reorder buffer
            this._reserveStations[type].associateFU(instrRef, num, this.functionalUnit[type][num].fillFlow(instruction));
            this._reorderBuffer.executeInstruction(instrROBRef);
            break; // only execute one instruction per cycle
        }
    }

    ticExecute(): void {
        // Go through all the Functional Unit
        for (let i = 0; i < FUNCTIONALUNITTYPESQUANTITY; i++) {
            for (let j = 0; j < this.functionalUnitNumbers[i]; j++) {
                if (this.functionalUnit[i][j].isFree()) {
                    this.executeInstruction(i, j);
                }
            }
        }

        // Go through all the Address ALU and execute the address calculus
        for (let i = 0; i < this.functionalUnitNumbers[FunctionalUnitType.MEMORY]; i++) {
            let inst = this.aluMem[i].getTopInstruction();
            if (inst != null) {
                // if an instruction is ready, write the result address to the reorder buffer and reserve station
                let instRef = this._reserveStations[FunctionalUnitType.MEMORY].getFUInstruction(i, this.aluMem[i].getLast(), true);
                let instROBRef = this._reserveStations[FunctionalUnitType.MEMORY].getROBReference(instRef);
                let baseAddress = this._reserveStations[FunctionalUnitType.MEMORY].getAddressOperand(instRef);
                let offset = this._reserveStations[FunctionalUnitType.MEMORY].getSecondOperandValue(instRef);
                let address = baseAddress + offset;

                this._reorderBuffer.writeResultAddress(instROBRef, address);
                this._reserveStations[FunctionalUnitType.MEMORY].setAddressOperand(instRef, address);
            }

            this.aluMem[i].tic();
        }

        // Go again through all the memory reserve stations but this time sending the instructions to the address ALU
        for (let i = 0; i < this.functionalUnitNumbers[FunctionalUnitType.MEMORY]; i++) {
            let readyInstsRefs = this._reserveStations[FunctionalUnitType.MEMORY].getReadyInstructions(true); // we dont need the first operand ready, as we are only calculating the address
            for (let instrRef of readyInstsRefs) {
                let instrROBRef = this._reserveStations[FunctionalUnitType.MEMORY].getROBReference(instrRef);
                let instruction = this._reorderBuffer.getInstruction(instrROBRef);

                if (instruction.isStoreInstruction() || instruction.isLoadInstruction()) {
                    if (!this._reorderBuffer.hasResultAddress(instrROBRef)) {
                        // assosiate the instruction with the address ALU, 
                        // so their address can be calculated
                        this._reserveStations[FunctionalUnitType.MEMORY].associateAddressALU(instrRef, i, this.aluMem[i].fillFlow(instruction));
                        this._reorderBuffer.executeInstruction(instrROBRef);
                        break;
                    }
                }
            }
        }
    }

    writeInstruction(type: FunctionalUnitType, num: number) {
        let resul;
        let inst: Instruction = this.functionalUnit[type][num].getTopInstruction();
        if (inst != null) {
            let instRef = this._reserveStations[type].getFUInstruction(num, this.functionalUnit[type][num].getLast());
            let instROBRef = this._reserveStations[type].getROBReference(instRef);
            let firstValue = this._reserveStations[type].getFirstOperandValue(instRef);
            let secondValue = this._reserveStations[type].getSecondOperandValue(instRef);
            let opcode = inst.opcode;
            /* tslint:disable:ter-indent */
            switch (opcode) {
                case Opcodes.ADD:
                case Opcodes.ADDI:
                case Opcodes.ADDF:
                    resul = firstValue + secondValue;
                    break;
                case Opcodes.SUB:
                case Opcodes.SUBF:
                    resul = firstValue - secondValue;
                    break;
                case Opcodes.OR:
                    resul = firstValue | secondValue;
                    break;
                case Opcodes.AND:
                    resul = firstValue & secondValue;
                    break;
                case Opcodes.XOR:
                    resul = firstValue ^ secondValue;
                    break;
                case Opcodes.NOR:
                    resul = ~(firstValue | secondValue);
                    break;
                case Opcodes.SRLV:
                    resul = firstValue >> secondValue;
                    break;
                case Opcodes.SLLV:
                    resul = firstValue << secondValue;
                    break;
                case Opcodes.MULT:
                case Opcodes.MULTF:
                    resul = firstValue * secondValue;
                    break;
                // En esta fase no se hace nada con los STORES
                case Opcodes.LW:
                case Opcodes.LF:
                    let a = this.memory.getDatum(this._reserveStations[type].getAddressOperand(instRef));
                    resul = a.datum;
                    if (!a.got) {
                        this.functionalUnit[type][num].status.stall = this.memoryFailLatency - this.functionalUnit[type][num].latency;
                    }
                    break;
                case Opcodes.BEQ:
                    resul = (firstValue === secondValue) ? 1 : 0;
                    break;
                case Opcodes.BNE:
                    resul = (firstValue !== secondValue) ? 1 : 0;
                    break;
                case Opcodes.BGT:
                    resul = (firstValue > secondValue) ? 1 : 0;
                    break;
                /* tslint:enable:ter-indent */
            }
            // Finish the instruction execution
            if (this.functionalUnit[type][num].status.stall === 0) {
                if ((opcode !== Opcodes.BNE) && (opcode !== Opcodes.BEQ) && (opcode !== Opcodes.BGT)) {
                    // Update all the reserve stations values that are waiting for this result
                    for (let j = 0; j < FUNCTIONALUNITTYPESQUANTITY; j++) {
                        this._reserveStations[j].setROBValue(instROBRef, resul);
                    }
                }
                this._reorderBuffer.writeResultValue(instROBRef, resul);

                // Remove the instruction entry from the reserve station
                this._reserveStations[type].removeInstruction(instRef);
            }
        }
    }

    ticWriteResult(): void {
        // First check for all STORES that are ready and write them
        //TODO: this is a really bad way to do this, as stores skips the execution stage and go directly to the write result stage
        // so here we are doing the execution stage of the stores. And also, we are writing the result of all the stores at the same time with no limits
        // why? because potatos
        let readyLoadsRefs = this._reserveStations[FunctionalUnitType.MEMORY].getReadyInstructions();
        let refsToRemove = new Array<number>();
        for (let instrRef of readyLoadsRefs) {
            let instrROBRef = this._reserveStations[FunctionalUnitType.MEMORY].getROBReference(instrRef);
            let instruction = this._reorderBuffer.getInstruction(instrROBRef);

            if (instruction.isStoreInstruction()) {
                // check that is really ready, as the memory address can be not calculated yet
                if (!this._reorderBuffer.hasResultAddress(instrROBRef)) {
                    continue;
                }

                // write the result to the ROB and remove the instruction from the reserve station
                this._reorderBuffer.writeResultValue(instrROBRef, this._reserveStations[FunctionalUnitType.MEMORY].getFirstOperandValue(instrRef));
                //this._reserveStations[FunctionalUnitType.MEMORY].removeInstruction(instrRef);
                refsToRemove.push(instrRef);
            }
        }
        for (let instrRef of refsToRemove) {
            this._reserveStations[FunctionalUnitType.MEMORY].removeInstruction(instrRef);
        }

        // Now it's time to retrieve all the results from the UFs
        for (let i = 0; i < FUNCTIONALUNITTYPESQUANTITY; i++) {
            for (let j = 0; j < this.functionalUnitNumbers[i]; j++) {
                if (this.functionalUnit[i][j].status.stall === 0) {
                    this.writeInstruction(i, j);
                }
                // Update clocks of the uf
                this.functionalUnit[i][j].tic();
            }
        }
    }

    checkJump(instruction: Instruction, executionResult: number): boolean {
        // Check if the prediction was correct
        // Typescript does not support ^ operator for boolean
        if (+this._jumpPrediction.getPrediction(instruction.id) ^ +(!!executionResult)) {
            this._jumpPrediction.updatePrediction(instruction.id, !!executionResult);
            // Change pc
            if (executionResult) {
                //this.pc = this.code.getBasicBlockInstruction(rob.instruction.getOperand(2));
                // The new parser just put the line number instead of the basic block, it is more simple
                this.pc = instruction.getOperand(2);
            } else {
                this.pc = instruction.id + 1;
            }

            // Clean functional Units and Reserve Stations,
            for (let i = 0; i < FUNCTIONALUNITTYPESQUANTITY; i++) {
                for (let j = 0; j < this.functionalUnitNumbers[i]; j++) {
                    this.functionalUnit[i][j].clean();
                    this._reserveStations[i].clear();
                }
            }

            // Clean the alus for the address calculus
            for (let i = 0; i < this.functionalUnitNumbers[FunctionalUnitType.MEMORY]; i++) {
                this.aluMem[i].clean();
            }

            // Clean prefetch, decoder and reorder buffer, the simplest way is
            // to rebuild the objects
            this._prefetchUnit.clean();
            this._decoder.clean();
            this._reorderBuffer.clear();

            // Clean the structures related to the registers
            this._gpr.setAllBusy(false);
            this._fpr.setAllBusy(false);
            return false;
        }
        this._jumpPrediction.updatePrediction(instruction.id, !!executionResult);
        return true;
    }

    ticCommit(): CommitStatus {
        for (let i = 0; i < this.issue; i++) {
            if (this._reorderBuffer.canCommitStoreInstruction()) {
                this.memory.setDatum(this._reorderBuffer.getResultAddress(), this._reorderBuffer.getResultValue());
            } else if (this._reorderBuffer.canCommitJumpInstruction()) {
                if (!this.checkJump(this._reorderBuffer.getInstruction(), this._reorderBuffer.getResultValue())) {
                    this._reorderBuffer.commitInstruction();
                    // the jump was mispredicted
                    return CommitStatus.SUPER_COMMITMISS;
                }
            } else if (this._reorderBuffer.canCommitRegisterInstruction()) {
                let instruction = this._reorderBuffer.getInstruction();
                let isFloat = instruction.isDestinyRegisterFloat();
                if (!isFloat) {
                    this._gpr.setContent(instruction.getDestinyRegister(), this._reorderBuffer.getResultValue(), false);
                } else {
                    this._fpr.setContent(instruction.getDestinyRegister(), this._reorderBuffer.getResultValue(), false);
                }

                if (this._reorderBuffer.purgeCommitMapping()) {
                    if (!isFloat) {
                        this._gpr.setBusy(instruction.getDestinyRegister(), false);
                    } else {
                        this._fpr.setBusy(instruction.getDestinyRegister(), false);
                    }
                }
            } else if (this._reorderBuffer.isEmpty()) {
                return CommitStatus.SUPER_COMMITEND;
            } else {
                return CommitStatus.SUPER_COMMITNO;
            }

            this._reorderBuffer.commitInstruction();
            // update all references to the rob entries in the reserve stations
            for (let j = 0; j < FUNCTIONALUNITTYPESQUANTITY; j++) {
                this._reserveStations[j].updateROBRefs();
            }
        }
        return CommitStatus.SUPER_COMMITOK;
    }

    tic(): SuperescalarStatus {
        this.status.cycle++;

        let commit = this.ticCommit();
        if (commit !== CommitStatus.SUPER_COMMITEND && commit !== CommitStatus.SUPER_COMMITMISS) {
            this.ticWriteResult();
            this.ticExecute();
        }

        let resultIssue = this.ticIssue();
        let resultDecoder = this.ticDecoder() ? 0 : 1;
        let resultPrefetch = this.ticPrefetch() ? 0 : 1;

        if ((resultIssue + resultDecoder + resultPrefetch === 0) &&
            (commit === CommitStatus.SUPER_COMMITEND)) {
            return SuperescalarStatus.SUPER_ENDEXE;
        }

        if (this._prefetchUnit.hasBreakpoint()) {
            this.status.breakPoint = true;
            return SuperescalarStatus.SUPER_BREAKPOINT;
            
        }
        return SuperescalarStatus.SUPER_OK;
    }

    public get code(): Code {
        return this._code;
    }

    public set code(value: Code) {
        this._code = value;
    }

    public get issue(): number {
        return this._issue;
    }

    public set issue(value: number) {
        this._issue = value;
    }

    public get reorderBuffer(): ReorderBuffer {
        return this._reorderBuffer;
    }

    public getReserveStation(type: FunctionalUnitType): ReserveStation {
        return this._reserveStations[type];
    }

    public get prefetchUnit(): PrefetchUnit {
        return this._prefetchUnit;
    }

    public get decoder(): PrefetchUnit {
        return this._decoder;
    }

    public get aluMem(): FunctionalUnit[] {
        return this._aluMem;
    }

    public set aluMem(value: FunctionalUnit[]) {
        this._aluMem = value;
    }

    public get jumpPrediction(): JumpPredictor {
        return this._jumpPrediction;
    }

}
