export const codeInput = `7
ADDI R2 R0 #3
BGT R0 R2 ET1
ADDI R3 R0 #2
ET1:
SUB R4 R3 R2
BGT R2 R3 ET2
SUB R5 R2 R3
ET2:
SUB R6 R2 R3
`;

export const resultContent = [3, 2, -1, 0, 1];