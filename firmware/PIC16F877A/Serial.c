#include <xc.h>
#include <stdio.h>

#include "Serial.h"

void UART_Write(char data)
{
  while (!TXIF)
    ;
  TXREG = data;
}

void UART_Write_Text(const char *text)
{
  while (*text)
    UART_Write(*text++);
}

void UART_Write_Number(uint32_t num)
{
  char buf[11];
  sprintf(buf, "%lu", (unsigned long)num);
  UART_Write_Text(buf);
}

// EOF
