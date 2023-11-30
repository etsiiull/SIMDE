import { expect, beforeEach, test } from 'vitest'
import { Code } from '../../../core/Common/Code';
import { Superescalar } from '../../../core/Superescalar/Superescalar';
import { SuperescalarStatus } from '../../../core/Superescalar/SuperescalarEnums';
import { codeInput } from '../code/speculativenosideeffects';


const context: { code: Code, machine: Superescalar } = { code: null, machine: null };

beforeEach(() => {
    context.code = new Code();
    context.machine = new Superescalar();
    context.machine.init(true);
});

test('Speculative execution has no side effects', t => {
    // Execute code
    context.code.load(codeInput);
    context.machine.code = context.code;
    while (context.machine.tic() !== SuperescalarStatus.SUPER_ENDEXE) { }

    // Check R5 value
    expect(context.machine.getGpr(5)).toBe(0);

    // Check memory pos 5 value
    expect(context.machine.memory.getDatum(5).datum).toBe(0);

    // Check F1 value
    expect(context.machine.getFpr(1)).toBe(0);

    // Check jump prediction table
    expect(context.machine.jumpPrediction[7]).toBe(0);

    // Check where the program counter is
    expect(context.machine.pc).toBe(9);

    // Check the number of cycles are correct
    expect(context.machine.status.cycle).toBe(30);
})