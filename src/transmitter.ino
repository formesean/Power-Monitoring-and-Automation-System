#define BUTTON1 2
#define BUTTON2 3
char message1 = '1';
char message2 = '0';

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON1, INPUT);
  pinMode(BUTTON1, INPUT);
}

void loop() {
  int state1 = digitalRead(BUTTON1);
  int state2 = digitalRead(BUTTON2);

  if(state1 == HIGH){
    Serial.write(message1);
    delay(200);
  }
  
  if(state2 == HIGH){
    Serial.write(message2);
    delay(200);
  }
   
}