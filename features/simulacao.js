module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("simulacao", controller);
    const utils = require('../requests/utils.js');
    const sabemiFunctions = require('../requests/sabemiFunctions.js');


    flow.addAction("intro")

    flow.before("intro",async(flow,bot)=>{
        
        
        // var user = {
        //     "userName": "Ruan Rossato",
        //     "cpf": "4587576879",
        //     "phoneNumber": "5511992448799",
        //     "codigo":"45875076879"
        // }
        // flow.setVar("user",user)


        flow.setVar("firstName",flow.vars.user.userName.split(" ")[0])
        flow.setVar("maskedCPF","xxx.xxx.xx"+flow.vars.user.cpf[flow.vars.user.cpf.length-3]+"-"+flow.vars.user.cpf.slice(-2))
        flow.setVar("retry",0)
    })

    flow.addQuestion("[introduction]+++Antes de iniciar nossa conversa, para segurança dos seus dados, preciso garantir que estou falando com a pessoa certa:\
                    \n\n *{{vars.firstName}}*\
                    \n CPF: {{vars.maskedCPF}}\
                    \n\nÉ você mesmo?😊\
                    \n\nDigite 1 para: Sim, sou eu\
                    \nDigite 2 para: Não conheço esta pessoa", 
                    async(response, flow, bot) =>{
                        if(response =="1"){
                        }

                        else if(response == "2"){
                            await flow.gotoThread("notRightPerson");
                        }

                        else{
                            await bot.say("[introduction]+++Não entendi o que falou. Digite *1*, se for você ou *2*, se você não conhecer essa pessoa")
                            await flow.repeat();
                        }
                        
                    },
                    "rightPerson",
                    "intro");
       
    flow.addMessage("[notRightPerson]+++Ops! Peço desculpas pelo incômodo. Obrigado por avisar!","notRightPerson")
    flow.addMessage("[FINISH]+++[notRightPerson]","notRightPerson")

    flow.addMessage("[introduction]+++Que bom! Para que eu possa apresentar uma proposta na medida, vou precisar que você me informe alguns dos seus dados pessoais.\
                \n\nMas fique tranquilo: este é um ambiente seguro e seus dados estão protegidos e guardados, tudo de acordo com a Lei Geral de Proteção de Dados (LGPD) e Direito do Consumidor 🔒. Para saber mais sobre LGPD 👉🏼 https://www.sabemi.com.br/politica-de-privacidade",
                "intro")
    
    flow.addAction("userInfo","intro")
    flow.addQuestion("[userInfo]+++Vamos lá!? Me conta qual é o seu *nome completo*?", 
                    async(response, flow, bot) =>{
                        flow.setVar("firstName",response.split(" ")[0])
                        
                    },
                    "name",
                    "userInfo");

    
    flow.addQuestion(`[userInfo]+++Legal! Digite aqui pra mim os *3 primeiros dígitos do seu CPF*`,
                    async(response, flow, bot) =>{
                        let user = flow.vars.user;
                        let validatedUser = await sabemiFunctions.validateUser(user.codigo, response, flow.vars.name);
                        console.log(validatedUser)
                        if(validatedUser.sucesso){
                            let optIn = await sabemiFunctions.optIn(user.codigo);
                        }
                        else{
                            if(flow.vars.retry = 0){
                                await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação.\
                                            \nDigite seu *nome completo*, sem abreviações e *apenas os 3 primeiros dígitos do seu CPF*, ok!?");
                                flow.setVar("retry",1);
                                await flow.gotoThread("userInfo");
                            }
                            else if(flow.vars.retry = 1){
                                await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação de novo.\
                                            \nVamos tentar mais uma vez?\
                                            \nDigite seu *nome completo*, sem abreviações e *apenas os 3 primeiros dígitos do seu CPF*, ok!?");
                                flow.setVar("retry",2);
                                await flow.gotoThread("userInfo");
                            }
                            else if(flow.vars.retry = 2){
                                if(await utils.workingHours()){
                                    bot.say("[userInfo]+++Puxa! Não consegui validar os seus dados.\
                                            \nVou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗");
                                }
                                else{
                                    await bot.say("[userInfo]+++Puxa! Não consegui validar os seus dados e no momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente.\
                                            \n⏱ Retorne com um alô, por aqui mesmo, no próximo dia útil entre 09h e 18h, de segunda a sexta-feira, e estaremos prontos para te ajudar!\
                                            \nBjs e até breve");
                                }
                                await bot.say("[FINISH]+++[userInfo]")
                                await bot.cancelAllDialogs();
                            }
                        }
                    },
                    "cpf",
                    "userInfo"); 

    flow.addAction("preSimulation","userInfo")
    flow.before("preSimulation", async(flow,bot)=>{
       
        let simulation = await sabemiFunctions.firstSimulation(flow.vars.user.codigo)
        console.log(simulation)
        
        if(simulation){
            if(simulation.sucesso){
                flow.setVar("simulacao",simulation)
                flow.setVar("simulationKey", simulation.chaveSimulacao);
        
                try{
                    console.log(simulation.tabelas)
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
                    console.log(error)
                    await bot.say("Infelizmente, não foi possível gerar uma simulação para você agora 😕. Tente novamente mais tarde, ok?")
                    flow.gotoThread("endConversation")
                }
            }
            
        }
        else{
            await bot.say("Infelizmente, não foi possível gerar uma simulação para você agora 😕. Tente novamente mais tarde, ok?")
            flow.gotoThread("endConversation")
        }
    });

    flow.addMessage("[preSimulation]+++Ah, se você preferir finalizar nossa conversa, basta digitar *PARAR* a qualquer momento, ok!? 🛑",
                    "preSimulation");

    flow.addMessage("[preSimulation]+++Estamos quase lá! Estou checando as informações e validando a melhor proposta para você! 👩🏻‍💻",
                    "preSimulation");

    flow.addMessage("[preSimulation]+++💡 Enquanto isso, {{vars.firstName}}, confira o *melhor plano para proteção* de toda a sua família!\
                    \n\nConfira no vídeo abaixo todos os benefícios e vantagens deste plano Exclusivo para você! 👇🏻",
                    "preSimulation");
    
    
    flow.addAction("simulationResults","preSimulation");

    flow.before("simulationResults",async(flow,bot)=>{
        bot.say("[SIMULACAO]+++"+JSON.stringify(flow.vars.simulacao))
    });

    flow.addQuestion("[simulation]+++Pronto! Agora que você já conhece um pouco mais nossos produtos, veja as condições que consegui para você 💁🏻‍♀‍ \
    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValueAP}}* em {{vars.simulationInstallmentsAP}} parcelas de R$ {{vars.simulationIntallmentsPriceAP}} + *Seguro de Acidente Pessoal* por R$ {{vars.simulationInsurancePriceAP}}\
    \n\n 👉🏼 *Assistência Financeira de R$ {{vars.simulationValue}}* em {{vars.simulationInstallments}} parcelas de R$ {{vars.simulationIntallmentsPrice}}\
    \n\nDigite *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
    \nDigite *2* para seguir com a contratação de Assistência Financeira\
    \nDigite *3* para saber mais sobre as vantagens do Seguro Sabemi\
    \n\nQuer uma nova simulação? É só digitar *4*",

                    async(response,flow,bot) =>{
                        if(response=="1"){
                            flow.setVar("table",flow.vars.simulationTableAP)
                            console.log(flow.vars)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("table",flow.vars.simulationTable)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await flow.gotoThread("clarifyInsurance");                
                        }
                        else if(response =="4"){
                            await flow.gotoThread("newSimulation");
                        }
                        else{
                            await bot.say("[simulation]+++Por favor, *digite um número de 1 a 4*, correspondente à ação que quer tomar")
                            await flow.repeat()
                        }
                    },
                    "tableChoice",
                    "simulationResults");


    flow.before("signUp", async(flow,bot)=>{
        var signUpMessage = "";

        let closeContract = await sabemiFunctions.closeContract(flow.vars.user.codigo,flow.vars.table,flow.vars.simulationKey)
        flow.setVar("urlContract",closeContract.url)

        if(flow.vars.tableChoice == "1"){
            signUpMessage = `Confira aqui o resumo do plano escolhido:\
            \n\n_Assistência Financeira_\
            \nR$ ${flow.vars.simulationValueAP} em ${flow.vars.simulationInstallmentsAP}x parcelas de R$ ${flow.vars.simulationIntallmentsPriceAP}\
            \n\n_Seguro Proteção Pessoal_\
            \nCapital Segurado de R$ 10.000,00\
            \nCobertura de Morte acidental\
            \nPrêmio mensal de R$ ${flow.vars.simulationInsurancePriceAP}\
            \n\nServiços e benefícios:\
            \n✔️ Assistência. Funeral Individual\
            \n✔️ Assistência Residencial\
            \n✔️ Assistência Pet Básica\
            \n✔️ Assistência Proteção Pessoal\
            \n✔️ TEM Saúde\
            \n✔️ Clube de Vantagens Sabemi`;
        }
        else{
            signUpMessage = `Confira aqui o resumo do plano escolhido:\
            \n\n_Assistência Financeira_\
            \nR$ ${flow.vars.simulationValue} em ${flow.vars.simulationInstallments}x parcelas de R$ ${flow.vars.simulationInstallments}\
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
                    \n- *Documento de identificação (RG, CNH)*\
                    \n- *Comprovante de residência*\
                    \n- *Contracheque*\
                    \n\n👉🏼 Logo precisaremos deles!",
                    "signUp")


    flow.addMessage("[signUp]+++Aqui está o link que eu te falei 📲 *{{vars.urlContract}}*\
                    \nAtravés dele você dará *continuidade na sua contratação* e ficará ainda mais perto de *realizar os seus sonhos!* 😍",
                    "signUp")

                    
    flow.addMessage("[signUp]+++Ah! Você não tem cadastro no Sabemi Digital ou não lembra sua senha? Pode deixar que vou enviar seus dados de acesso por SMS 📩\
                    \nE se precisar é só me chamar! Basta digitar *SOL* que eu volto 😊",
                    "signUp")


    flow.addMessage("[clarifyInsurance]+++<inserir informações do seguro incluso>","clarifyInsurance");
    flow.addMessage("[clarifyInsurance]+++Agora que ficou mais claro, vou reapresentar a proposta e você me diz o que achou","clarifyInsurance");
    flow.addAction("simulationResults","clarifyInsurance")

    flow.addQuestion("[simulation]+++Me conta sua motivação para uma nova simulação 🧐\
                    \nDigite *1* para: Valor *muito abaixo* do que espero\
                    \nDigite *2* para: Valor *acima* do que preciso para o momento.",

                    async(response,flow,bot) =>{
                        if(response=="1"){
                            await flow.gotoThread("transferToHuman")
                        }
                        else if(response =="2"){
                            await flow.gotoThread("lowerValue")
                        }
                        else{
                            await bot.say("[simulation]+++Por favor, *digite 1 ou 2*, correspondente à ação que quer tomar")
                            await flow.repeat()
                        }
                    },
                    "insitutionChoice",
                    "newSimulation");

    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",
                                    "Entendi! Vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \nRetorne com um alô, por aqui mesmo, no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("[transferToHuman]+++{{vars.messageTransfer}}","transferToHuman");

    flow.addQuestion("[simulation]+++Entendi! Me conta qual *valor total que você precisa*? 😄\
                    \nAh, para eu compreender, *digite somente os números, com os centavos separados por vírgula*, combinado!?",
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
                        if(response=="2"){
                            await bot.say("[simulation]+++Ok, vamos tentar de novo. Não se esqueça de *escrever somente os números* e *separar os centavos com vírgula*")
                            await flow.gotoThread("lowerValue")
                            return
                        }
                        await bot.say("[newSimulation]+++Ok! Estou checando se conseguimos outro cenário para te apresentar 👩🏻‍💻")
                        var valor  = parseFloat(flow.vars.beautifiedValue.replace(",",".").replace(".",""))
                        let simulation = await sabemiFunctions.newSimulation(flow.vars.user.codigo,valor)
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
                                    await bot.say("Infelizmente, não foi possível gerar uma simulação para você agora 😕. Tente novamente mais tarde, ok?")
                                    flow.gotoThread("endConversation")
                                }
                                flow.gotoThread("newSimulationResults")
                            }
                        }
                        else{
                            await bot.say("Infelizmente, não foi possível gerar uma simulação para você agora 😕. Tente novamente mais tarde, ok?")
                            flow.gotoThread("endConversation")
                        }
                    },
                    "neededValue",
                    "lowerValueSimulation"
    );

    flow.before("newSimulationResults",async(flow,bot)=>{
        bot.say("[SIMULACAO]+++"+JSON.stringify(flow.vars.simulacao))
    });
    flow.addQuestion("[newSimulation]+++{{vars.firstName}}, analisando aqui, verifiquei as possíveis opções para você 💁🏻‍♀‍ \
                    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValueAP}}* em {{vars.simulationInstallmentsAP}} parcelas de R$ {{vars.simulationIntallmentsPriceAP}} + *Seguro de Acidente Pessoal* por R$ {{vars.simulationInsurancePriceAP}}\
                    \n\n 👉🏼 *Assistência Financeira de R$ {{vars.simulationValue}}* em {{vars.simulationInstallments}} parcelas de R$ {{vars.simulationIntallmentsPrice}}\
                    \n\nDigite *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
                    \nDigite *2* para seguir com a contratação de Assistência Financeira\
                    \nDigite *3* para cancelar\
                    \n\nDigite *4* para falar com um de nossos Especialistas 😀",
                    async(response,flow,bot)=>{
                        if(response=="1"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",true)
                            flow.setVar("table",flow.vars.simulationTableAP)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",false)
                            flow.setVar("table",flow.vars.simulationTable)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await bot.say("[newSimulation]+++Puxa, que pena! 😕\nEspero que a gente converse em outro momento!\
                            \nSe você desejar falar com algum colega Especialista, pode ligar no *0800 000 000*, e estaremos prontos para te atender!\
                            \nAté a próxima!! 🙋🏻")              
                        }
                        else if(response =="4"){
                            await flow.gotoThread("transferToHuman");
                        }
                        else{
                            await bot.say("[newSimulation]+++Por favor, *digite um número de 1 a 4*, correspondente à ação que quer tomar")
                            await flow.repeat()
                        }
                    },
                    "tableChoice",
                    "newSimulationResults")
    
    flow.addMessage("[ending]+++Se desejar falar com a Sabemi, é só me chamar! Basta digitar *Sol* que estarei pronta para atender 😉!","endConversation")
    flow.addMessage("[FINISH]+++[ending]","endConversation")
    controller.addDialog(flow);
};