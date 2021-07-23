module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("simulacao", controller);

    const utils = require('../requests/utils.js');
    const sabemiFunctions = require('../requests/sabemiFunctions.js');


    flow.addAction("intro")

    flow.before("intro",async(flow,bot)=>{
        
        console.log(flow.vars.user)

        const{MongoClient} = require('mongodb');
        var url = process.env.MONGO_URI
        
        const client = new MongoClient(url,{ useUnifiedTopology: true });
        try{
            await client.connect();
            var  database =  client.db("sabemi")
            var collection = database.collection("users")
            var user  = await collection.findOne({"phoneNumber": flow.vars.user })
            console.log(user)

            flow.setVar("userDB",user)
        }
        catch (err){
            console.log(err)
        }
        finally {
            await client.close();
        }

        if(user.transfered){
            await flow.gotoThread("returnTransfer");
        }

        flow.setVar("firstName",flow.vars.userDB.name.split(" ")[0])
        flow.setVar("maskedCPF","xxx.xxx.xx"+flow.vars.userDB.cpf[flow.vars.userDB.cpf.length-3]+"-"+flow.vars.userDB.cpf.slice(-2))
        flow.setVar("retry",0)
    })

    flow.addMessage("[ReturnTransfer]+++Lembrando que para falar com um de nossos Especialista é só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗","returnTransfer")
    flow.addMessage("[FINISH]+++Retorno ao bot depois de transbordo","returnTransfer")

    flow.addQuestion("[introduction]+++Antes de iniciar nossa conversa, para segurança dos seus dados, preciso garantir que estou falando com a pessoa certa:\
                    \n\n*{{vars.firstName}}*\
                    \nCPF: {{vars.maskedCPF}}\
                    \n\nÉ você? 😊\
                    \n\nDigite 1 para: Sim, sou eu\
                    \nDigite 2 para: Não conheço esta pessoa", 
                    async(response, flow, bot) =>{
                        if(response =="1"){
                            flow.gotoThread("userInfo")
                        }

                        else if(response == "2"){
                            await flow.gotoThread("notRightPerson");
                        }

                        else{
                            flow.gotoThread("introRetry")
                        }
                        
                    },
                    "rightPerson",
                    "intro");

    flow.addQuestion("[introduction]+++Ops, digitação invalida 🤔\
                    \nVamos tentar novamente?",
        async(response, flow, bot) =>{
                    if(response =="1"){
                        flow.gotoThread("userInfo")
                    }

                    else if(response == "2"){
                        await flow.gotoThread("notRightPerson");
                    }
                    else{
                        if(await utils.workingHours()){
                            await bot.say(`[userInfo]+++Puxa! Não consegui validar os seus dados.\
                                            \n\nÉ só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                            \n\nTudo será resolvido por lá! 👩🏻‍💻`)
                        }
                        else{
                            await bot.say("[userInfo]+++Puxa! Não consegui validar os seus dados e no momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente.\
                                    \n\n⏱ Retorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH, no próximo dia útil entre 09h e 18h, de segunda a sexta-feira, e estaremos prontos para te ajudar!\
                                    \n\nBjs e até breve");
                        }
                        await bot.say("[TRANSFER]+++[Dados pessoais incorretos]")
                        await bot.cancelAllDialogs();
                    }
                    
                },
    "rightPerson",
    "introRetry");

    flow.addMessage("[WRONGPERSON]+++")
    flow.addMessage("[notRightPerson]+++Ops! Peço desculpas pelo incômodo. Obrigado por me avisar!","notRightPerson")
    flow.addMessage("[notRightPerson]+++Se desejar falar com a Sabemi, é só me chamar! Basta digitar *Sol* que estarei pronta para te atender! 😉","notRightPerson")
    flow.addMessage("[FINISH]+++[Contato incorreto]","notRightPerson")

    flow.addMessage("[introduction]+++Que bom! Para que eu possa apresentar uma proposta na medida, vou precisar que você me informe alguns dos seus dados pessoais","intro")
    flow.addMessage("[introduction]+++Mas fique tranquilo: este é um ambiente seguro e seus dados estão protegidos e guardados, tudo de acordo com a Lei Geral de Proteção de Dados (LGPD) e Direito do Consumidor 🔒\
                    \n\nPara saber mais sobre LGPD\
                    \n👉🏼 https://www.sabemi.com.br/politica-de-privacidade",
                    "intro")
    
    flow.addQuestion("[userInfo]+++Vamos lá!? Me conta qual é o seu *nome completo*?", 
                    async(response, flow, bot) =>{
                        flow.setVar("firstName",response.split(" ")[0])
                        
                    },
                    "name",
                    "userInfo");

    
    flow.addQuestion(`[userInfo]+++Legal! Digite aqui pra mim os *3 primeiros dígitos do seu CPF*`,
                    async(response, flow, bot) =>{
                        await bot.say("[userInfo]+++Aguarde um segundinho enquanto valido seus dados")
                        let user = flow.vars.userDB;
                        let validatedUser = await sabemiFunctions.validateUser(user.codigo, response, flow.vars.name);
                        
                        // let validatedUser={"sucesso":true};
                        
                        if(validatedUser){
                            let optIn = await sabemiFunctions.optIn(user.codigo, true, user.phoneNumber);
                            await bot.say("[VALIDATION]+++true")
                        }
                        else{                            
                            await bot.say("[VALIDATION]+++false")
                            if(flow.vars.retry == 0){
                                await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação.\
                                            \nDigite seu *nome completo*, sem abreviações e *apenas os 3 primeiros dígitos do seu CPF*!");
                                flow.setVar("retry",1);
                                
                                await flow.gotoThread("userInfo");
                            }
                            else if(flow.vars.retry == 1){
                                await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação de novo.\
                                            \nVamos tentar mais uma vez?\
                                            \nDigite seu *nome completo*, sem abreviações e *apenas os 3 primeiros dígitos do seu CPF*!");
                                flow.setVar("retry",2);
                                await flow.gotoThread("userInfo");
                            }
                            else if(flow.vars.retry == 2){
                                if(await utils.workingHours()){
                                    await bot.say(`[userInfo]+++Puxa! Não consegui validar os seus dados.\
                                                    \n\nÉ só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                                    \n\nTudo será resolvido por lá! 👩🏻‍💻`)
                        
                                    // bot.say("[userInfo]+++Puxa! Não consegui validar os seus dados.\
                                    //         \nVou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗");
                                }
                                else{
                                    await bot.say("[userInfo]+++Puxa! Não consegui validar os seus dados e no momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente.\
                                            \n\n⏱ Retorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH, no próximo dia útil entre 09h e 18h, de segunda a sexta-feira, e estaremos prontos para te ajudar!\
                                            \n\nBjs e até breve");
                                }
                                await bot.say("[TRANSFER]+++[Dados pessoais incorretos]")
                                await bot.cancelAllDialogs();
                            }
                        }
                    },
                    "cpf",
                    "userInfo"); 

    flow.addAction("preSimulation","userInfo")
    flow.before("preSimulation", async(flow,bot)=>{
    });

    flow.addMessage("[preSimulation]+++Ah, se você preferir finalizar nossa conversa, basta digitar *PARAR* a qualquer momento! 🛑",
                    "preSimulation");

    flow.addMessage("[preSimulation]+++Estamos quase lá! Estou checando as informações e validando a melhor proposta para você! 👩🏻‍💻",
                    "preSimulation");

    flow.addMessage("[preSimulation]+++💡 Enquanto isso, {{vars.firstName}}, confira o *melhor plano para proteção* de toda a sua família!\
                    \n\nConfira nas imagens abaixo todos os benefícios e vantagens deste plano Exclusivo para você! 👇🏻",
                    "preSimulation");
    
    flow.addMessage("[IMAGE]+++https://media-sabemi.s3.sa-east-1.amazonaws.com/Bot+Vendas_1.png","preSimulation")
    flow.addMessage("[IMAGE]+++https://media-sabemi.s3.sa-east-1.amazonaws.com/Bot+Vendas_2.png","preSimulation")
    flow.addQuestion("[DELAYQUESTION]+++ ",async(response, flow, bot) =>{},"","preSimulation")
    
    
    flow.addAction("simulationResults","preSimulation");

    flow.before("simulationResults",async(flow,bot)=>{
        await new Promise(r => setTimeout(r, 15000));
        let user = flow.vars.userDB;
        let simulation = await sabemiFunctions.firstSimulation(flow.vars.userDB.codigo, user.phoneNumber)
        // let simulation = {
        //     "tabelas": [
        //     {
        //     "codigoTabela": 5154836,
        //     "prazo": "72",
        //     "valorVenda": "100.000,00",
        //     "valorLiquido": "100.000,00",
        //     "valorParcela": "850",
        //     "taxa": "1,3",
        //     "valorPeculio": "0",
        //     "valorAP": "0,00"
        //     },
        //     {
        //         "codigoTabela": 5154836,
        //         "prazo": "72",
        //         "valorVenda": "100.000,00",
        //         "valorLiquido": "100.000,00",
        //         "valorParcela": "850",
        //         "taxa": "1,3",
        //         "valorPeculio": "0,00",
        //         "valorAP": "50,00"
        //         },
        //     ],
        //     "chaveSimulacao": "irure elit Duis",
        //     "sucesso": true
        // }
        console.log(simulation)

        if(simulation){
            if(simulation.sucesso){
                flow.setVar("simulacao",simulation)
                flow.setVar("simulationKey", simulation.chaveSimulacao);
        
                try{
                    for (let tabela of simulation.tabelas){
                        if(tabela.valorAP == "0,00"){
                            flow.setVar("simulationValue", tabela.valorLiquido );
                            flow.setVar("simulationInstallments", tabela.prazo);
                            flow.setVar("simulationIntallmentsPrice", tabela.valorParcela);
                            flow.setVar("simulationTable", tabela);
                        }
                        else{
                            flow.setVar("simulationValueAP", tabela.valorLiquido );
                            flow.setVar("simulationInstallmentsAP", tabela.prazo);
                            flow.setVar("simulationIntallmentsPriceAP", tabela.valorParcela);
                            flow.setVar("simulationInsurancePriceAP", tabela.valorAP);
                            flow.setVar("simulationTableAP", tabela);
                        }
                    }
                    
                    bot.say("[SIMULACAO]+++"+JSON.stringify(flow.vars.simulacao))
                }
                catch(error){
                    console.log(error)
                    await bot.say("[preSimulation]+++Infelizmente, não foi possível gerar uma simulação para você agora 😕\nTente novamente mais tarde, ok?")
                    flow.gotoThread("endConversation")
                }
            }
            
        }
        else{
            bot.say("[preSimulation]+++Infelizmente, não foi possível gerar uma simulação para você agora 😕\nTente novamente mais tarde, ok?")
            flow.gotoThread("endConversation")
        }
    });

    flow.addQuestion("[simulation]+++Pronto! Agora que você já conhece um pouco mais nossos produtos, veja as condições que consegui para você 💁🏻‍♀‍ \
    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValueAP}}* em {{vars.simulationInstallmentsAP}} parcelas de R$ {{vars.simulationIntallmentsPriceAP}} + *Seguro de Acidente Pessoal* por R$ {{vars.simulationInsurancePriceAP}}\
    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValue}}* em {{vars.simulationInstallments}} parcelas de R$ {{vars.simulationIntallmentsPrice}}\
    \n\nDigite *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
    \n\nDigite *2* para seguir com a contratação de Assistência Financeira\
    \n\nDigite *3* para saber mais sobre as vantagens do Seguro Sabemi\
    \n\nQuer uma nova simulação? É só digitar *4*",

                    async(response,flow,bot) =>{
                        if(response=="1"){
                            flow.setVar("table",flow.vars.simulationTableAP)
                            await bot.say("[CHOICE]+++1")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("table",flow.vars.simulationTable)
                            await bot.say("[CHOICE]+++2")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await flow.gotoThread("transferToHuman");                
                        }
                        else if(response =="4"){
                            await flow.gotoThread("newSimulation");
                        }
                        else{
                            await flow.gotoThread("simulationRetry")
                        }
                    },
                    "tableChoice",
                    "simulationResults");

    flow.addQuestion("[simulation]+++Puxa😕 Essa opção não é válida.\
                    \nVamos tentar novamente?",
        async(response, flow, bot) =>{
                    if(response=="1"){
                            flow.setVar("table",flow.vars.simulationTableAP)
                            await bot.say("[CHOICE]+++1")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("table",flow.vars.simulationTable)
                            await bot.say("[CHOICE]+++2")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await flow.gotoThread("transferToHuman");                
                        }
                        else if(response =="4"){
                            await flow.gotoThread("newSimulation");
                        }
                        else{
                            await flow.gotoThread("transferToHumanFail")
                        }
                },
    "tableChoice",
    "simulationRetry");
    
    flow.before("signUp", async(flow,bot)=>{
        var signUpMessage = "";
        let user = flow.vars.userDB;
        let closeContract = await sabemiFunctions.closeContract(flow.vars.userDB.codigo,flow.vars.table,flow.vars.simulationKey, user.phoneNumber)
        console.log(closeContract)
        if(!closeContract){
            await bot.say("[URL]+++"+"https://digital.sabemi.com.br")
            flow.setVar("urlContract","https://digital.sabemi.com.br")
            console.log("URL BACKUP")
        }

        else{
            await bot.say("[URL]+++"+closeContract.url)
            flow.setVar("urlContract",closeContract.url)
            console.log(flow.vars.urlContract)
        }
        

        flow.setVar("urlContract","https://digital.sabemi.com.br")
        
        if(flow.vars.tableChoice == "1"){
            signUpMessage = `Confira aqui o resumo do plano escolhido:\
            \n\n_Assistência Financeira_\
            \nR$ ${flow.vars.simulationValueAP} em ${flow.vars.simulationInstallmentsAP}x parcelas de R$ ${flow.vars.simulationIntallmentsPriceAP}\
            \n\n_Seguro Proteção Pessoal_\
            \nCapital Segurado de R$ 10.000,00\
            \nCobertura de Morte acidental\
            \nPrêmio mensal de R$ ${flow.vars.simulationInsurancePriceAP}\
            \n\nServiços e benefícios:\
            \n✔️ Assistência Funeral Individual\
            \n✔️ Assistência Residencial\
            \n✔️ Assistência Pet Básica\
            \n✔️ Assistência Proteção Pessoal\
            \n✔️ Clube de Vantagens Sabemi\
            \n✔️ TEM Saúde – Descontos de até 80% na compra de medicamentos, e até 70% de economia em consultas e exames.`;
        }
        else{
            signUpMessage = `Confira aqui o resumo do plano escolhido:\
            \n\n_Assistência Financeira_\
            \nR$ ${flow.vars.simulationValue} em ${flow.vars.simulationInstallments}x parcelas de R$ ${flow.vars.simulationIntallmentsPrice}\
            \n\nSem Seguro Proteção Pessoal`;
        }
        flow.setVar("signUpMessage",signUpMessage);
    })
    flow.addMessage("[signUp]+++{{vars.signUpMessage}}",
                    "signUp")

    flow.addMessage("[signUp]+++Vou te encaminhar um link para *formalizar sua contratação*\
                    \nNosso processo é ágil e 100% digital 📱😎",
                    "signUp")


    flow.addMessage("[signUp]+++Ah, e já aproveite para deixar os seguintes documentos separados 📑\
                    \n\n- *Documento de identificação (RG, CNH)*\
                    \n- *Comprovante de residência*\
                    \n- *Contracheque*\
                    \n\n👉🏼 Logo precisaremos deles!",
                    "signUp")


    flow.addMessage("[signUp]+++Aqui está o link que eu te falei 📲 *{{vars.urlContract}}*\
                    \n\nAtravés dele você dará *continuidade na sua contratação* e ficará ainda mais perto de *realizar os seus sonhos!* 😍",
                    "signUp")

                    
    flow.addMessage("[signUp]+++Ah! Você não tem cadastro no Sabemi Digital ou não lembra sua senha? \
                    \nPode deixar que vou enviar seus dados de acesso por SMS 📩\
                    \n\nE se precisar é só me chamar! Basta digitar *SOL* que eu volto 😊",
                    "signUp")


    flow.addMessage("[clarifyInsurance]+++<inserir informações do seguro incluso>","clarifyInsurance");
    flow.addMessage("[clarifyInsurance]+++Agora que ficou mais claro, vou reapresentar a proposta e você me diz o que achou","clarifyInsurance");
    flow.addAction("simulationResults","clarifyInsurance")

    flow.addQuestion("[simulation]+++Me conta sua motivação para uma nova simulação 🧐\
                    \n\nDigite *1* para: Valor *muito abaixo* do que espero\
                    \nDigite *2* para: Valor *acima* do que preciso para o momento.",

                    async(response,flow,bot) =>{
                        if(response=="1"){
                            await flow.gotoThread("transferToHuman")
                        }
                        else if(response =="2"){
                            await flow.gotoThread("lowerValue")
                        }
                        else{
                            await flow.gotoThread("newSimulationRetry")
                        }
                    },
                    "insitutionChoice",
                    "newSimulation");
    
    flow.addQuestion("[simulation]+++Puxa😕 Essa opção não é válida. \
                    \nVamos tentar novamente?",
        async(response, flow, bot) =>{
                    if(response=="1"){
                            await flow.gotoThread("transferToHuman")
                        }
                        else if(response =="2"){
                            await flow.gotoThread("lowerValue")
                        }
                        else{
                            await flow.gotoThread("transferToHumanFail")
                        }
                },
    "insitutionChoice",
    "newSimulationRetry");


    flow.addQuestion("[simulation]+++Entendi! Me conta qual *valor total que você precisa*? 😄\
                    \n\nAh, para eu compreender, *digite somente os números, com os centavos separados por vírgula*, combinado!?",
                    async(response,flow,bot)=>{
                        value=response.replace(".", "")

                        var beautifiedValue=""
                        if(!value.includes(",")){
                            value=value+",00"
                            
                        }
                        else{
                            if(value.split(",")[1].length<1){
                                value = value +"00"
                            }
                            else if(value.split(",")[1].length<2){
                                value = value +"0"
                            }
                        }
                        

                        var index=0

                        for (var i = value.length - 4; i >= 0; i--) {
                            if(index%3==0 && index != 0){
                                beautifiedValue="."+beautifiedValue
                            }
                            beautifiedValue = value[i] +beautifiedValue
                            index+=1
                        }     
                            
                        beautifiedValue = beautifiedValue+","+value.slice(-2)
                        
                        flow.setVar("beautifiedValue",beautifiedValue)                           
                        
                        
                    },
                    "neededValue",
                    "lowerValue"
    );

    flow.addAction("lowerValueSimulation","lowerValue")
            
    flow.addQuestion("[simulation]+++Você confirma que quer uma nova simulação com o valor de *R$ {{vars.beautifiedValue}}*?\
                    \n\nDigite *1* para seguir com a simulação nesse valor\
                    \nDigite *2* para trocar o valor",
                    async(response,flow,bot)=>{
                        if(response=="1"){
                            await bot.say("[newSimulation]+++Ok! Estou checando se conseguimos outro cenário para te apresentar 👩🏻‍💻")
                            var valor  = parseFloat(flow.vars.beautifiedValue.replace(",",".").replace(".",""))
                            let user = flow.vars.userDB;
                            let simulation = await sabemiFunctions.newSimulation(flow.vars.userDB.codigo,valor, user.phoneNumber)
                            console.log(simulation)
                            if(simulation){
                                if(simulation.sucesso){
                                    flow.setVar("simulacao",simulation)
                                    flow.setVar("simulationKey", simulation.chaveSimulacao);
                                    try{
                                        for (let tabela of simulation.tabelas){
                                            if(tabela.valorAP == "0,00"){
                                                flow.setVar("simulationValue", tabela.valorLiquido );
                                                flow.setVar("simulationInstallments", tabela.prazo);
                                                flow.setVar("simulationIntallmentsPrice", tabela.valorParcela);
                                                flow.setVar("simulationTable", tabela);
                                            }
                                            else{
                                                flow.setVar("simulationValueAP", tabela.valorLiquido );
                                                flow.setVar("simulationInstallmentsAP", tabela.prazo);
                                                flow.setVar("simulationIntallmentsPriceAP", tabela.valorParcela);
                                                flow.setVar("simulationInsurancePriceAP", tabela.valorAP);
                                                flow.setVar("simulationTableAP", tabela);
                                            }
                                        }
                                    }
                                    catch(error){
                                        await bot.say("[simulation]+++Infelizmente, não foi possível gerar uma simulação para você agora 😕. Tente novamente mais tarde, ok?")
                                        flow.gotoThread("endConversation")
                                    }
                                    flow.gotoThread("newSimulationResults")
                                }
                            }
                            else{
                                await bot.say("[simulation]+++Infelizmente, não foi possível gerar uma simulação para você agora 😕. Tente novamente mais tarde, ok?")
                                flow.gotoThread("endConversation")
                            }
                        }
                        else if(response=="2"){
                            await bot.say("[simulation]+++Ok, vamos tentar de novo. Não se esqueça de *escrever somente os números* e *separar os centavos com vírgula*")
                            await flow.gotoThread("lowerValue")
                            return
                        }
                        else{
                            flow.gotoThread("lowerValueSimulationRetry")
                        }
                        
                    },
                    "neededValue",
                    "lowerValueSimulation"
    );

    flow.addQuestion("[simulation]+++Puxa😕 Essa opção não é válida. \
                    \nVamos tentar novamente?",
        async(response, flow, bot) =>{
                    if(response=="1"){
                        await bot.say("[newSimulation]+++Ok! Estou checando se conseguimos outro cenário para te apresentar 👩🏻‍💻")
                        var valor  = parseFloat(flow.vars.beautifiedValue.replace(",",".").replace(".",""))
                        let user = flow.vars.userDB;
                        let simulation = await sabemiFunctions.newSimulation(flow.vars.userDB.codigo,valor, user.phoneNumber)
                        console.log(simulation)
                        if(simulation){
                            if(simulation.sucesso){
                                flow.setVar("simulacao",simulation)
                                flow.setVar("simulationKey", simulation.chaveSimulacao);
                                try{
                                    for (let tabela of simulation.tabelas){
                                        if(tabela.valorAP == "0,00"){
                                            flow.setVar("simulationValue", tabela.valorLiquido );
                                            flow.setVar("simulationInstallments", tabela.prazo);
                                            flow.setVar("simulationIntallmentsPrice", tabela.valorParcela);
                                            flow.setVar("simulationTable", tabela);
                                        }
                                        else{
                                            flow.setVar("simulationValueAP", tabela.valorLiquido );
                                            flow.setVar("simulationInstallmentsAP", tabela.prazo);
                                            flow.setVar("simulationIntallmentsPriceAP", tabela.valorParcela);
                                            flow.setVar("simulationInsurancePriceAP", tabela.valorAP);
                                            flow.setVar("simulationTableAP", tabela);
                                        }
                                    }
                                }
                                catch(error){
                                    await bot.say("[simulation]+++Infelizmente, não foi possível gerar uma simulação para você agora. 😕 Tente novamente mais tarde, ok?")
                                    flow.gotoThread("endConversation")
                                }
                                flow.gotoThread("newSimulationResults")
                            }
                        }
                        else{
                            await bot.say("[simulation]+++Infelizmente, não foi possível gerar uma simulação para você agora. 😕 Tente novamente mais tarde, ok?")
                            flow.gotoThread("endConversation")
                        }
                    }
                    else if(response=="2"){
                        await bot.say("[simulation]+++Ok, vamos tentar de novo. Não se esqueça de *escrever somente os números* e *separar os centavos com vírgula*")
                        await flow.gotoThread("lowerValue")
                        return
                    }
                    else{
                        flow.gotoThread("transferToHumanFail")
                    }
                },
    "tableChoice",
    "lowerValueSimulationRetry");

    flow.before("newSimulationResults",async(flow,bot)=>{
        bot.say("[SIMULACAO]+++"+JSON.stringify(flow.vars.simulacao))
    });
    flow.addQuestion("[newSimulation]+++{{vars.firstName}}, analisando aqui, verifiquei as possíveis opções para você 💁🏻‍♀‍ \
                    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValueAP}}* em {{vars.simulationInstallmentsAP}} parcelas de R$ {{vars.simulationIntallmentsPriceAP}} + *Seguro de Acidente Pessoal* por R$ {{vars.simulationInsurancePriceAP}}\
                    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValue}}* em {{vars.simulationInstallments}} parcelas de R$ {{vars.simulationIntallmentsPrice}}\
                    \n\nDigite *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
                    \n\nDigite *2* para seguir com a contratação de Assistência Financeira\
                    \n\nDigite *3* para cancelar\
                    \n\nDigite *4* para falar com um de nossos Especialistas 😀",
                    async(response,flow,bot)=>{
                        if(response=="1"){
                            flow.setVar("table",flow.vars.simulationTableAP)
                            await bot.say("[CHOICE]+++1")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("table",flow.vars.simulationTable)
                            await bot.say("[CHOICE]+++2")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await bot.say("[newSimulation]+++Puxa, que pena! 😕\
                            \n\nEspero que a gente converse em outro momento!\
                            \nSe você desejar falar com algum colega Especialista, pode ligar no *0800 880 1900*, e estaremos prontos para te atender!\
                            \n\nAté a próxima!! 🙋🏻")              
                            await flow.gotoThread("evaluation")         
                        }
                        else if(response =="4"){
                            await flow.gotoThread("transferToHuman");
                        }
                        else{
                            await flow.gotoThread("newSimulationRetry")
                        }
                    },
                    "tableChoice",
                    "newSimulationResults")

    flow.addQuestion("[simulation]+++Puxa😕 Essa opção não é válida. \
                \nVamos tentar novamente?",
        async(response, flow, bot) =>{
                    if(response=="1"){
                            flow.setVar("table",flow.vars.simulationTableAP)
                            await bot.say("[CHOICE]+++1")                            
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("table",flow.vars.simulationTable)
                            await bot.say("[CHOICE]+++2")
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await bot.say("[newSimulation]+++Puxa, que pena! 😕\
                            \n\nEspero que a gente converse em outro momento!\
                            \nSe você desejar falar com algum colega Especialista, pode ligar no *0800 880 1900*, e estaremos prontos para te atender!\
                            \n\nAté a próxima!! 🙋🏻");    
                            await flow.gotoThread("evaluation")         
                        }
                        else if(response =="4"){
                            await flow.gotoThread("transferToHuman");
                        }
                        else{
                            await flow.gotoThread("transferToHumanFail")
                        }
                },
    "tableChoice",
    "newSimulationRetry");
                
    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",`Entendi! É só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                    \n\nTudo será resolvido por lá! 👩🏻‍💻`)
                        // flow.setVar("messageTransfer",
                        //             "Entendi! Vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \n\nRetorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH , no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("[transferToHuman]+++{{vars.messageTransfer}}","transferToHuman");
    flow.addMessage("[TRANSFER]+++[Transferência Prevista]","transferToHuman");

    flow.before("transferToHumanFail", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",`Entendi! É só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                    \n\nTudo será resolvido por lá! 👩🏻‍💻`)
                        // flow.setVar("messageTransfer",
                        //             "Puxa, a opção digitada é invalida! 😐\
                        //             \n\nMas fique tranquilo, vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa! ⏱ ´Mas no momento meus colegas estão fora do horário de atendimento, a sua mensagem está aqui guardada com a gente\
                                    \n\nRetorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH , no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("[transferToHuman]+++{{vars.messageTransfer}}","transferToHumanFail");
    flow.addMessage("[TRANSFER]+++[Transferência Erro no fluxo]","transferToHumanFail");

    flow.addQuestion("[simulation]+++Posso te pedir uma ajudinha?\
                    \nVocê poderia avaliar este atendimento?\
                    \nJuro que é rapidinho e vai me ajudar a te atender cada vez melhor 😃\
                    \n\nDigite 1 para: muito satisfeito\
                    \nDigite 2 para: satisfeito\
                    \nDigite 3 para: não me ajudou\
                    \nDigite 4 para: péssimo\
                    \n\nBj e até a próxima!",
                    async(response,flow,bot)=>{
                        if(response!="1" &&response!="2" &&response!="3" &&response!="4" ){
                            flow.gotoThread("evaluationRetry")
                        }
                        else{
                            flow.gotoThread("evaluationEnd")
                        }
                    },
                    "evaluation",
                    "evaluation"
    );
    flow.addQuestion("[simulation]+++Puxa 😕 Essa opção não é válida.\
                    \nVamos tentar novamente?",
                    async(response,flow,bot)=>{
                        if(response!="1" &&response!="2" &&response!="3" &&response!="4" ){
                            await flow.gotoThread("transferToHumanFail") 
                        }
                        else{
                            flow.gotoThread("evaluationEnd")
                        }
                    },
                    "evaluation",
                    "evaluationRetry"
    );

    flow.addMessage("[simulation]+++Obrigada! Se precisar falar comigo, é só digitar \"Sol\"\
        \nBj e até a próxima!",
        "evaluationEnd"
    );

    flow.addMessage("[ending]+++Se desejar falar com a Sabemi, é só me chamar! Basta digitar *Sol* que estarei pronta para atender! 😉","endConversation")
    flow.addMessage("[FINISH]+++[Encerramento Padrão]","endConversation")
    controller.addDialog(flow);
};