#ifndef SERIAL_H
#define SERIAL_H

#include <stdint.h>

// Function Prototypes
void UART_Write(char data);
void UART_Write_Text(const char *text);
void UART_Write_Number(uint32_t num);

#endif

// EOF
