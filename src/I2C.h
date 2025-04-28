#ifndef I2C_H
#define I2C_H

// Function Prototypes

// Initializes the I2C master mode
void init_I2C_Master(void);

// Waits until all I2C operations are finished
void I2C_Wait(void);

// Generates a start condition for I2C communication
void I2C_Start(void);

// Generates a stop condition for I2C communication
void I2C_Stop(void);

// Generates a repeated start condition for I2C communication
void I2C_RepeatedStart(void);

// Sends a byte of data via I2C
void I2C_Send(unsigned char data);

// Receives a byte of data via I2C and returns it
// `ack` specifies whether to send ACK or NACK after receiving data
unsigned char I2C_Receive(unsigned char ack);

#endif

// EOF
