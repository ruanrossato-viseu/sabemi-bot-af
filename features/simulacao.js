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
        flow.setVar("maskedCPF","***.***.**"+flow.vars.user.cpf[flow.vars.user.cpf.length-3]+"-"+flow.vars.user.cpf.slice(-2))
        flow.setVar("retry",0)
    })

    flow.addQuestion("[introduction]+++Antes de iniciar nossa conversa, para segurança dos seus dados, preciso garantir que estou falando com a pessoa certa\
                    \n\n *{{vars.firstName}}*\
                    \n CPF: {{vars.maskedCPF}}\
                    \n\nÉ você mesmo?😊\
                    \n\nDigita 1 para: Sim, sou eu\
                    \nDigita 2 para: Não conheço esta pessoa", 
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
       
    flow.addMessage("[ending]+++Ops! Peço desculpas pelo incômodo. Obrigado por avisar!","notRightPerson")
    flow.addAction("endConversation","notRightPerson")

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

    
    flow.addQuestion(`[userInfo]+++Legal! Digita aqui pra mim os *3 primeiros dígitos do seu CPF*`,
                    async(response, flow, bot) =>{
                        let user = flow.vars.user;
                        let validatedUser = await sabemiFunctions.validateUser(user.codigo, response, flow.vars.name);
                        console.log(validatedUser)
                        if(validatedUser.sucesso){
                            let optIn = await sabemiFunctions.optIn(user.codigo);
                        }
                        else{
                            if(flow.vars.reply = 0){
                                await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação.\
                                            \nDigite seu *nome completo*, sem abreviações e *apenas os 3 primeiros dígitos do seu CPF*, ok!?");
                                flow.setVar("reply",1);
                                await flow.gotoThread("userInfo");
                            }
                            else if(flow.vars.reply = 1){
                                await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação de novo.\
                                            \nVamos tentar mais uma vez?\
                                            \nDigite seu *nome completo*, sem abreviações e *apenas os 3 primeiros dígitos do seu CPF*, ok!?");
                                flow.setVar("reply",2);
                                await flow.gotoThread("userInfo");
                            }
                            else if(flow.vars.reply = 2){
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
       
        if(simulation.sucesso){
            flow.setVar("simulacao",simulation)
            flow.setVar("simulationKey", simulation.chaveSimulacao);
       
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
        else{
            //TODO falha na requisição
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
    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValueAP}}* em {{vars.simulationInstallmentsAP}} parcelas de R$ {{vars.simulationIntallmentsPriceAP}} + *Seguro de Acidente Pessoal R$ {{vars.simulationInsurancePriceAP}}*\
    \n 👉🏼 *Assistência Financeira de R$ {{vars.simulationValue}}* em {{vars.simulationInstallments}} parcelas de R$ {{vars.simulationIntallmentsPrice}}\
    \n\nDigita *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
    \nDigita *2* para seguir com a contratação de Assistência Financeira\
    \nDigita *3* para saber mais sobre as vantagens do Seguro Sabemi\
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


    flow.addMessage("[signUp]+++Ah, e já aproveita para deixar os seguintes documentos separados 📑\
                    \n- *Documento de identificação (RG, CNH)*\
                    \n- *Comprovante de residência*\
                    \n- *Contracheque*\
                    \n\n👉🏼 Logo precisaremos deles!",
                    "signUp")


    flow.addMessage("[signUp]+++Aqui esta o link que eu te falei 📲 *www.sabemidigital.com.br*\
                    \nAtravés dele você  dará *continuidade na sua contratação* e ficará ainda mais perto de *realizar os seus sonhos!*",
                    "signUp")

                    
    flow.addMessage("[signUp]+++Ah! E se você não tem cadastro no Sabemi ou não lembra sua senha, pode deixar que vou enviar seus dados de acesso por SMS 📩\
                    \nE se precisar é só me chamar! Basta digitar *SOL* que eu volto 😊",
                    "signUp")

    flow.addMessage("[clarifyInsurance]+++<inserir informações do seguro incluso>","clarifyInsurance");
    flow.addMessage("[clarifyInsurance]+++Agora que ficou mais claro, vou reapresentar a proposta e você me diz o que achou","clarifyInsurance");
    flow.addAction("simulationResults","clarifyInsurance")

    flow.addQuestion("[simulation]+++Me conta sua motivação para uma nova simulação 🧐\
                    \nDigita *1* para: Valor *muito abaixo* do que espero\
                    \nDigita *2* para: Valor *acima* do que preciso para o momento.",

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

    flow.addQuestion("[simulation]+++Entendi! Me conta qual *valor você precisa*? 😄\
                    \nAh, para eu compreender, *digite somente os números, com os centavos separados por vírgula*, combinado!?",
                    async(response,flow,bot)=>{
                        await bot.say("[newSimulation]+++Ok! Estou checando se conseguimos outro cenário para te apresentar 👩🏻‍💻")

                        let simulation = await sabemiFunctions.firstSimulation(flow.vars.user.codigo)
       
                        if(simulation.sucesso){
                            flow.setVar("simulacao",simulation)
                            flow.setVar("simulationKey", simulation.chaveSimulacao);
                       
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
                            flow.gotoThread("newSimulationResults")
                        }
                        else{
                            //TODO falha na requisição
                        }
                    },
                    "neededValue",
                    "lowerValue"
    );

    flow.before("newSimulationResults",async(flow,bot)=>{
        bot.say("[SIMULACAO]+++"+JSON.stringify(flow.vars.simulacao))
    });
    flow.addQuestion("[newSimulation]+++{{vars.firstName}}, analisando aqui, verifiquei as possíveis opções para você 💁🏻‍♀\
                    \n👉🏼 Assistência Financeira de *R$125.000,00 em 72 parcelas* + *Seguro de Acidente Pessoal R$xx,xx*\
                    \n👉🏼 Assistência Financeira de *R$125.000,00 em 72 parcelas*\
                    \n\nDigita *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
                    \nDigita *2* para seguir com a contratação de Assistência Financeira\
                    \nDigita *3* para cancelar\
                    \nDigita *4* para falar com um de nossos Especialistas :)",
                    async(response,flow,bot)=>{
                        if(response=="1"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",true)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",false)
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
                    "newSimulationChoice",
                    "newSimulationResults")
    
    flow.addMessage("Sempre que quiser falar comigo, é só me chamar mandando *Sol* 🌞! Até a próxima","endConversation")
    controller.addDialog(flow);
};