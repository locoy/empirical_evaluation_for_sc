const VM = require('ethereumjs-vm');
const Tx = require('ethereumjs-tx');
const sign = require('ethjs-signer').sign;
const BN = require('ethjs').BN;
const abi = require('ethjs-abi');
const util = require('ethjs-util');
const fs = require('fs');
const web3 = require('web3');


const vm = new VM({
    enableHomestead: true,
    activatePrecompiles: true
  });

  function firstCall(){

    //Data decleration
    global.funcall = 0 ;
    global.isrevertArr = [];
    global.isSelfDestructArr = [];
    global.executedfunNames = [];
    global.callfunNames = [];
    global.FreezingDetected = [];
    global.RepetedCallDetected = [];
    global.AssertionFunction = [];
    global.AllTransactionArr = [];
    global.undefinedcounter =0;

    fs.readFile(process.argv[2], (err, data) => { 
      global.testedContract = process.argv[2]; 
      if (err) throw err;
      let inputFile = JSON.parse(data);
      var temp=[];
      var accountInfowithBalances=[];
      var accountInfo = inputFile.accounts;

      console.log("************** " + testedContract +" **************" );
      Object.keys(inputFile.accounts).forEach(function(key) {

        temp['Account']= key;
        temp['Address']= accountInfo[key];
        temp['Balance']= 100;
        accountInfowithBalances.push(temp);
      });
      inputFile.transactions.forEach((val,index) => {
        
        if(val.record.type!='constructor'){
        runMethod({
          bytecode: contract_bytecode,
          interface: contract_interface},
          val.id, val.record.name, val.record.parameters, val.record.from, accountInfowithBalances,val.record.type);
      }
      else
      {
        contract_bytecode = val.record.bytecode;
        var abi_num = val.record.abi;
        contract_interface = inputFile.abis[abi_num];

           runMethod({
            bytecode: contract_bytecode,
            interface: contract_interface},
            val.id, val.record.name, val.record.parameters, val.record.from, accountInfowithBalances,val.record.type);
      }
    });
  });
}

function vulDetectionLastCheck(){
 
  if(funcall==0)
  {
    funcall++;
  
  //Sefa Akca - Announced UnChecked send - SelfDestruct - Freezing Ether
	var uncheckedSendAnnoncedArr = [];
  var selfdestructAnnoncedArr = [];
	for(var i=0; i<callfunNames.length; i++)
	{
	    var name = callfunNames[i];
	    var val = isrevertArr[i];

	    if(uncheckedSendAnnoncedArr.length == 0 || !uncheckedSendAnnoncedArr.some(e=> e.Name === name)){
          var pair = {};
          for(var k=i; k<callfunNames.length ; k++)
          {
              if(name == callfunNames[k])
              {
                val = val + isrevertArr[k];
                pair['Name'] = name;
                pair['Val'] =val;
              }
          }
          uncheckedSendAnnoncedArr.push(pair);
	     }
   }
   //console.log(uncheckedSendAnnoncedArr);
	 uncheckedSendAnnoncedArr.forEach(function(each){
	     if(each.Val==0){
        console.log('Error Type: Unchecked send => detected at ' + each.Name + ' function');
       }
	        	
	 });
		  
	for(var i = 0; i< FreezingDetected.length; i++)
	{
	    if(!uncheckedSendAnnoncedArr.some(e=> e.Name === FreezingDetected[i].Name)){
        console.log('Error Type: FreezingEther => detected at ' + FreezingDetected[i].Name + ' function');
	     }
	    else{
        var foundedindex = uncheckedSendAnnoncedArr.indexOf(FreezingDetected[i].Name);
        if(foundedindex!=-1 && uncheckedSendAnnoncedArr[foundedindex].Val !=0)
          console.log('Error Type: FreezingEther => detected at ' + FreezingDetected[i].Name + ' function');
		  }
			  	
  }
  

	   RepetedCallDetected.forEach(function(entry) {
      console.log('Error Type: Repeated Call => detected at ' + entry.Name + ' function');
      });


      AssertionFunction.forEach(function(entry) {
        console.log('Error Type: Assertion Error => Detected at ' + entry.Name + ' function. It can be Integer Overflow, Integer Underflow or Division by zero');
        });
        
	   for(var i =0; i<isSelfDestructArr.length;i++)
	   {
        if(isSelfDestructArr[i]==1)
        {
          var selfDestructpair = {};
          var name = executedfunNames[i];
          var val = 1;
          selfDestructpair['Name'] = name;
          selfDestructpair['Val'] = val;
          selfDestructpair ['isMultipleFunCall'] = false;
          for(var y = i-1; y>=0; y--)
          {
                
              if(executedfunNames[y]==name)
              {
                selfDestructpair ['isMultipleFunCall'] = true;
                selfDestructpair['Val'] = val + isSelfDestructArr[y];
              }
          }
          selfdestructAnnoncedArr.push(selfDestructpair);
        }
	   }
	   for(var i =0 ; i<selfdestructAnnoncedArr.length; i++)
	   {
	       if(selfdestructAnnoncedArr[i].Val>0 && selfdestructAnnoncedArr[i].isMultipleFunCall == false )
	       {
			      console.log('Error Type: Unchecked SELFDESTRUCT => detected at ' + selfdestructAnnoncedArr[i].Name + ' function');
	    	}
     }
    }//end of if
}
function runMethod(contract, id, methodName, inputs, from, accountInfo,transactionType) {

    global._testiteratedopcodes = [];
    

    const contractInterface = typeof contract.interface === 'string' ? JSON.parse(contract.interface) : contract.interface;
    var methodObject;
    if(transactionType=="constructor")
    {
      
       methodObject = contractInterface.filter(item => item.type === "constructor" ? 1 : 0)[0];
    } else if(transactionType=="fallback") {
      
      methodObject = contractInterface.filter(item => item.type === "fallback" ? 1 : 0)[0];
    }
    else{
     
      methodObject= contractInterface.filter(item => item.name === methodName ? 1 : 0)[0];
      if(methodObject==undefined){

        return;
      }
        
    }

    if(contract.bytecode==null || contract.bytecode==undefined || contract.bytecode.length==0){

      return
    }
    

    const address = accountInfo[from];
    const privateKey = '0xecbcd9838f7f2afa6e809df8d7cdae69aa5dfc14d563ee98e97effd3f6a652f2';
    const genesisData = { address: "1606938044258990275541962092341162602522202993782792835301376" };

      try {
        const tx = new Tx(sign({
            from: address,
            value: 0,
            gas: new BN('99999999999'),
            gasPrice: new BN('1'),
            nonce: new BN(0),
            data: contract.bytecode,
          }, privateKey));

        vm.runTx({ id: id, tx: tx, skipBalance: true, skipNonce: true }, (contractError, contractTx) => {

          /*console.log('BURADA 2')
          if(contractTx.createdAddress){
            //console.log('METHOD OBJECT UNDEFINED')
            console.log(undefinedcounter);
            console.log(contractTx.createdAddress.toString('hex'));
            undefinedcounter++;
          }*/
            
          global._iteratedopcodes = {};

         // CHECK ORIGIN USAGE
        global.txOriginResult = false;
        //CHECK TIME STAMP
        global.timestampResult = false;
          if (contractError) { return; }
          try {
          
            var tx2 = new Tx(sign({
              to: `0x${contractTx.createdAddress.toString('hex')}`,
              value: 0,
              gas: new BN('9999999999'),
              gasPrice: new BN('1'),
              nonce: new BN(1),
              data: abi.encodeMethod(methodObject, inputs),
            }, privateKey));
          

            vm.runTx({ id: id, tx: tx2, skipBalance: true, skipNonce: true }, (callError, callTx) => {

              console.log(callTx)
                
              if (callError) { reject(callError); return; }
              try {
                const outputBytecode = `0x${callTx.vm.return.toString('hex')}`;
                
                const result = abi.decodeMethod(methodObject, outputBytecode);
                
                //CHECK OUT OF GAS
                var totalgasUsage = new BN(callTx.vm.runState.gasLimit).sub(callTx.vm.runState.gasLeft);
                if(totalgasUsage<0)
                {
                  console.log('Error Type: Out of GAS => Gas limit exceed for ' + methodName + ' function. OUT OF GAS' );
                }
                //****************************** */
                for(var i =0;i<_iteratedopcodes[id].length;i++)
                  console.log(_iteratedopcodes[id][i]);
                console.log("****************************************")
                //CHECK TIMESTAMP - AND TRANSACTION ORIGIN
                txOriginResult = _iteratedopcodes[id].includes("ORIGIN");

                timestampResult = _iteratedopcodes[id].includes("TIMESTAMP");
                if(txOriginResult)
                  console.log('Error Type: Tx origin usage => detected in ' + methodName + ' and transaction id is ' + id);
                
                if(timestampResult)
                  console.log('Error Type: Timestamp usage => detected in ' + methodName + ' and transaction id is ' + id);
                //************************** */
                
                //ASSERTION ERROR CHECK
                if (callTx.vm.runState.opName == "INVALID" && callTx.vm.runState.opCode == 254) {
                  
                  if(AssertionFunction.length == 0 || !AssertionFunction.some(e=> e.Name === methodName)){
                    var AssertionChecked ={};
                    AssertionChecked['Index']=id;
                    AssertionChecked['Name']=methodName;
                   
                    AssertionFunction.push(AssertionChecked);
                  }
                }

                //CHECK UNCHECKED SEND
                 //Sefa Akca - exclude constructor
                if (methodName!= "") executedfunNames.push(methodName);

                //Sefa Akca - Check unchecked send - REVERT AFTER CALL	
                if (_iteratedopcodes[id].includes("CALL")) {
                    if (methodName != "") {
                      callfunNames.push(methodName);
                    }

                    var callindex = _iteratedopcodes[id].indexOf("CALL");
                    var isrevert = _iteratedopcodes[id].includes("REVERT", callindex);

                    if (isrevert) {
                      isrevertArr.push(1);
                    } else isrevertArr.push(0);
              }
              //************************************** */
              //CHECK FOR SELFDESTRUCT
              if (_iteratedopcodes[id].includes("SELFDESTRUCT")) {
                if (methodName != "") isSelfDestructArr.push(1);
              } else {
                if (methodName != "") isSelfDestructArr.push(0);
              }
              //Sefa Akca - Check Repeated Call in a sequence. 
              if(RepetedCallDetected.length == 0 || !RepetedCallDetected.some(e=> e.Name === methodName)){
                if(_iteratedopcodes[id].filter((v) => (v === "CALL")).length>1){
                    var repeatedCallChecked ={};
                    repeatedCallChecked['Index']=id;
                    repeatedCallChecked['Name']=methodName;
                    repeatedCallChecked['Times'] =_iteratedopcodes[id].filter((v) => (v === "CALL")).length
                    RepetedCallDetected.push(repeatedCallChecked);
                 }
            }
              

              } catch (error) {  /*console.log(error);*/ return; }//bytecodeError
            });
            setTimeout(() => {
              vulDetectionLastCheck();
            }, 5000);
          } catch (error) {/*console.log(error);*/ return; }
        });
      } catch (error) { /*onsole.log(error);*/ return; }

};

firstCall();
