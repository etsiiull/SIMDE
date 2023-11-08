export const codeInput = `// SWMDE v1.0
// Autor: Iván Castilla Rodríguez
// Utilidad: Programa de testeo de SWMDE
// Comentarios: El programa presupone q en la posición 50 (R2) de memoria tienes
// un vector de de 16 elementos y quieres sumar a cada elemento una cantidad 
// fija (en la posición de memoria 40). El resultado se coloca a partir de la 
// posición 70 (R3) de memoria.
// Este fichero es el mismo bucle de "bucle.pla" pero desenrollado para que en 
// cada iteración se hagan dos pasadas del bucle
//
14
	ADDI	R2 R0 #50
	ADDI	R3 R0 #70
	ADDI	R4 R0 #40
	LF	F0 (R4)
	ADDI	R5 R2 #16
LOOP:
	LF 	F1 (R2)
	LF 	F2 1(R2)
	ADDF	F1 F1 F0
	ADDF	F2 F2 F0
	SF	F1 (R3)
	SF	F2 1(R3)
	ADDI 	R2 R2 #2
	ADDI	R3 R3 #2
	BNE	R2 R5 LOOP`;

export const vliwCodeInput = `15
2	0 0 0 0	2 0 1 0
3	1 0 0 0	4 0 1 0	3 4 0 0
2	5 4 0 0	6 4 1 0
0
0
0
2	7 2 0 0	8 2 1 0
0
0
0
2	9 4 0 0	10 4 1 0
0
1	11 0 0 0
1	13 5 0 0 2 1 2
1	12 0 1 0`;