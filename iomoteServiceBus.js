/*
* Iomote Node.JS Service bus example
* In this example you can receive data sent form your device using the service bus connection
* string and queue names provided on your MyMote platform Dashboard User settings.
* For Further reference please refer to Microsoft's documentation
* https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-nodejs-how-to-use-queues
*
* From console run:
* - npm install azure
* - node ./iomoteServiceBus.js
* License: MIT license
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
var azure = require('azure');

var connStr = null; // <<<=== change this init with your service bus connection string you can find on MyMote platform dashboard
if (!connStr) {
  throw new Error('Must provide connection string');
}

var queueName = null;
var entityToken = 'EntityPath=';
var entityIndex = connStr.indexOf(entityToken);
var connStrLen = connStr.length;
if(entityIndex > 0) {
  // set a new queueName value:
  queueName = connStr.slice(entityIndex+entityToken.length, connStrLen);
  var serviceBusConnStr = connStr.substr(0, entityIndex-1);
}
if(!queueName) {
  throw new Error('Must provide connection string');
}
console.log("**********************************************************************");
console.log('* Connecting to ', serviceBusConnStr);
console.log('* Queue name ', queueName);
console.log("**********************************************************************");
var serviceBusService = azure.createServiceBusService(serviceBusConnStr);

// This function is responsable of reading messages from service bus queue
var rxQueue = function() {
  serviceBusService.receiveQueueMessage(queueName, function(error, receivedMessage){
    if(!error) {
      console.log("**********************************************************************");
      if(receivedMessage.body){
        console.log('[message] ', receivedMessage.body);
      }
      if(receivedMessage.customProperties) {
        let userRoute = receivedMessage.customProperties.user_route;
        let mId = receivedMessage.customProperties.mid;
        let devId = receivedMessage.customProperties['iothub-connection-device-id'];
        if(devId) {
          console.log('[device] ', devId);
        }
        if(mId) {
          console.log('[message id] ', mId);
        }
        if(userRoute) {
          console.log('[user route] ', userRoute);
        }
        console.log("**********************************************************************");
      }
    } 
  });
}
// set timed interval so in case your Service Bus client fails, it will register a new Queue Message received callback
var recInterval = setInterval(rxQueue, 5);
