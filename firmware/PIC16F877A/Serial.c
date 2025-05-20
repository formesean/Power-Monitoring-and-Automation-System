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

char UART_Read(void)
{
  while (!RCIF)
    ;
  if (OERR)
  {
    CREN = 0;
    CREN = 1;
  }
  return RCREG;
}

void UART_Read_Text(char *buffer, uint8_t length)
{
  uint8_t i = 0;
  char c;
  while (i < length - 1)
  {
    c = UART_Read();
    if (c == '\n' || c == '\r')
      break;
    buffer[i++] = c;
  }
  buffer[i] = '\0';
}

// EOF
