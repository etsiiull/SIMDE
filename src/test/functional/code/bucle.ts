export const codeInput = `// SWMDE v0.1
// Autor: Iván Castilla Rodríguez
// Utilidad: Programa de testeo de SWMDE
// Comentarios: El programa presupone q en la posición 50 (R2) de memoria tienes un vector de
// 16 elementos y quieres sumar a cada elemento una cantidad fija (en la posición de memoria
// 40). El resultado se coloca a partir de la posición 70 (R3) de memoria.
11
	ADDI	R2 R0 #50
	ADDI	R3 R0 #70
	ADDI	R4 R0 #40
	LF	F0 (R4)
	ADDI	R5 R2 #16
LOOP:
	LF 	F1 (R2)
	ADDF	F1 F1 F0
	SF	F1 (R3)
	ADDI 	R2 R2 #1
	ADDI	R3 R3 #1
	BNE	R2 R5 LOOP`;

export const vliwCodeInput = `15
2	0 0 0 0	2 0 1 0
3	1 0 0 0	4 0 1 0	3 4 0 0
1	5 4 0 0
0
0
0
1	6 2 0 0
1	8 0 0 0
0
0
1	7 4 1 0
0
0
1	10 5 0 0 2 1 2
1	9 0 1 0`;