#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ZMPT101B.h>

WiFiClient wifiClient;
HTTPClient httpClient;

// Global variables
int voltage = 0;
int current = 0;
int zero = 0;
uint16_t voltageSamples[10];
uint16_t currentSamples[10];
int sampleCount = 0;
unsigned long lastTalkBackCheck = 0;
const unsigned long talkBackInterval = 2500;
String uartBuffer = "";
const char *ssid = "sean-dako";
const char *pass = "qweasdzxc";
unsigned long myTalkBackID = 54567;
const char *myTalkBackKey = "OG6KNK3ER91ZD3UE";

// Function prototypes
int calibrate(const uint16_t *samples, size_t count);
float getVoltageAC(uint16_t frequency);
void connectWiFi();

void setup()
{
  Serial.begin(9600);
  connectWiFi();
}

void loop()
{
  // Read UART data from PIC
  while (Serial.available() && sampleCount < 10)
  {
    char c = Serial.read();
    uartBuffer += c;

    if (c == '\n')
    {
      uartBuffer.trim();

      if (uartBuffer.startsWith("DATA:"))
      {
        int sep = uartBuffer.indexOf(',');
        if (sep != -1)
        {
          voltage = uartBuffer.substring(5, sep).toInt();
          current = uartBuffer.substring(sep + 1).toInt();
          voltageSamples[sampleCount] = voltage;
          sampleCount++;
        }
      }

      uartBuffer = "";
    }
  }

  if (sampleCount == 10)
  {
    zero = calibrate(voltageSamples, 10);
    Serial.print("Calibrated zero: ");
    Serial.println(String(zero));
    sampleCount = 0;
  }

  if (millis() - lastTalkBackCheck > talkBackInterval)
  {
    lastTalkBackCheck = millis();

    String url = "http://api.thingspeak.com/talkbacks/" + String(myTalkBackID) + "/commands/execute";
    String postData = "api_key=" + String(myTalkBackKey) + "&headers=false";

    httpClient.begin(wifiClient, url);
    httpClient.addHeader("Content-Type", "application/x-www-form-urlencoded");

    int httpCode = httpClient.POST(postData);

    if (httpCode > 0 && httpCode == HTTP_CODE_OK)
    {
      String payload = httpClient.getString();
      payload.trim();

      if (payload.length() > 0)
      {
        if (payload == "Outlet_1_ON" || payload == "Outlet_1_OFF")
          Serial.write('1');
        else if (payload == "Outlet_2_ON" || payload == "Outlet_2_OFF")
          Serial.write('2');
        else if (payload == "Outlet_3_ON" || payload == "Outlet_3_OFF")
          Serial.write('3');
        else if (payload == "Outlet_4_ON" || payload == "Outlet_4_OFF")
          Serial.write('4');
        else if (payload == "ALL_ON" || payload == "ALL_OFF")
          Serial.write('5');
      }
    }
    else
    {
      Serial.print("HTTP Request failed, error: ");
      Serial.println(httpClient.errorToString(httpCode));
    }

    httpClient.end();
  }
}

int calibrate(const uint16_t *samples, size_t count)
{
  uint32_t acc = 0;

  for (size_t i = 0; i < count; i++)
  {
    acc += samples[i];
  }

  zero = acc / count;
  return zero;
}

float getVoltageAC(uint16_t frequency)
{
  uint32_t period = 1000000 / frequency;
  uint32_t t_start = micros();

  uint32_t Vsum = 0;
  uint32_t measurements_count = 0;
  int32_t Vnow;

  while (micros() - t_start < period)
  {
    Vnow = analogRead(pin) - zero;
    Vsum += Vnow * Vnow;
    measurements_count++;
  }
  float Vrms = sqrt(Vsum / measurements_count) / ADC_SCALE * Vref / sensitivity;

  return Vrms;
}

void connectWiFi()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);

    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED)
    {
      Serial.print(".");
      delay(1000);
    }
    Serial.println("\nWiFi Connected.");
  }
}

// EOF
