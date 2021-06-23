module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("solMenu", controller);
    const utils = require('../requests/utils.js');

    flow.addAction("intro");
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
    })

    flow.addQuestion("[SOL]+++Olá 🙋🏻 \
                    \nOlha, por aqui eu posso te ajudar com:\
                    \n\nDigite 1 para Link do APP Sabemi\
                    \nDigite 2 para Dúvida sobre minha simulação \
                    \nDigite 3 para Já executei o processo no APP Sabemi\
                    \nDigite 4 para Outras dúvidas / Falar com atendente",
        async(response, flow, bot)=>{        
            if(response == "1"){
                await bot.say("[SOL]+++Ok! Aqui está o link do APP Sabemi Digital 📲 https://digital.dsv.sabemi.com.br/\
                \n\nLembrando que é através dele que você dará continuidade na sua contratação e ficará ainda mais perto de realizar os seus sonhos!\
                \n\nAh, e lembrando que, se precisar, é só me chamar!\
                \nBasta digitar SOL que eu volto ☺")
                await bot.say("[FINISH]+++[Encerramento Padrão]","notRightPerson")
            }
            else if(response == "2"){
                if(flow.vars.userDB.hasOwnProperty("simulation")){
                    await flow.gotoThread("proposalInfo")                
                }
                else{
                    await bot.say("[SOL]+++Você ainda não possui simulações realizadas")
                }                
            }
            else if(response == "3"){
                await bot.say("[SOL]+++Então, se você já fez o processo de formalização digital no APP Sabemi, meus colegas devem estar cuidando e analisando sua proposta agora mesmo!\
                            \n\nE o legal é que no APP Sabemi você consegue acompanhar o status da sua proposta, mas, se desejar falar com algum dos nossos especialistas, você tem um jeito fácil: basta digitar 1 para que eles entrem em contato 😊")       
            }
            else if(response == "4"){
                await flow.gotoThread("userQuestion");            
            }
            else{
                await flow.gotoThread("introRetry")             
            }
        },
        "menuChoice",
        "intro"
    )

    flow.addQuestion("[SOL]+++Puxa 😕 Essa opção não é válida.\
        \nVamos tentar novamente?",
        async(response, flow, bot)=>{
            if(response == "1"){
                await bot.say("[SOL]+++Ok! Aqui está o link do APP Sabemi Digital 📲 https://digital.dsv.sabemi.com.br/\
                \n\nLembrando que é através dele que você dará continuidade na sua contratação e ficará ainda mais perto de realizar os seus sonhos!\
                \n\nAh, e lembrando que, se precisar, é só me chamar!\
                \nBasta digitar SOL que eu volto ☺")
                await bot.say("[FINISH]+++[Encerramento Padrão]","notRightPerson")
            }
            else if(response == "2"){
                if(flow.vars.userDB.hasOwnProperty("simulation")){
                    await flow.gotoThread("proposalInfo")                
                }
                else{
                    await bot.say("[SOL]+++Você ainda não possui simulações realizadas")
                }
            }
            else if(response == "3"){
                await bot.say("[SOL]+++Então, se você já fez o processo de formalização digital no APP Sabemi, meus colegas devem estar cuidando e analisando sua proposta agora mesmo!\
                            \n\nE o legal é que no APP Sabemi você consegue acompanhar o status da sua proposta, mas, se desejar falar com algum dos nossos especialistas, você tem um jeito fácil: basta digitar 1 para que eles entrem em contato 😊")       
            }
            else if(response == "4"){
                await flow.gotoThread("userQuestion");            
            }
            else{
                await flow.gotoThread("transferToHumanFail")           
            }
        },
        "menuChoice",
        "introRetry"
    )
    

    flow.addQuestion("[SOL]+++Vamos lá! Sobre sua proposta:\
                    \nDigite 1 se sua dúvida for sobre valores\
                    \nDigite 2 se você deseja falar com algum de nossos especialistas 😊",
                    async(response,flow,bot)=>{
                        if(response =="1"){
                            flow.gotoThread("proposalValue")
                        }
                        else if(response == "2"){
                            await flow.gotoThread("transferToHuman");  
                        }
                        else{
                            await flow.gotoThread("proposalInfoRetry") 
                        }
                    },
                    "proposalInfoChoice",
                    "proposalInfo"
    );

    flow.addQuestion("[SOL]+++Puxa 😕 Essa opção não é válida.\
                        \nVamos tentar novamente?",
                    async(response,flow,bot)=>{
                        if(response =="1"){
                            flow.gotoThread("proposalValue")
                        }
                        else if(response == "2"){
                            await flow.gotoThread("transferToHuman");  
                        }
                        else{
                            await flow.gotoThread("transferToHumanFail")  
                        }
                    },
                    "proposalInfoChoice",
                    "proposalInfoRetry"
    );
    flow.before("proposalValue", async(flow,bot)=>{
        for (let tabela of flow.vars.userDB.simulation.tabelas){
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
    })
    flow.addQuestion("[SOL]+++Verifiquei aqui que o valor da sua proposta é de\
                    \n\n👉🏼 *Assistência Financeira de R$ {{vars.simulationValueAP}}* em {{vars.simulationInstallmentsAP}} parcelas de R$ {{vars.simulationIntallmentsPriceAP}} + *Seguro de Acidente Pessoal* por R$ {{vars.simulationInsurancePriceAP}}\
                    \n\n 👉🏼 *Assistência Financeira de R$ {{vars.simulationValue}}* em {{vars.simulationInstallments}} parcelas de R$ {{vars.simulationIntallmentsPrice}}\
                    \n\nDigite 1 para seguir a contratação de Empréstimo Pessoal\
                    \nDigite 2 para cancelar\
                    \nDigite 3 para falar com algum de nossos especialistas",
                    async(response,flow,bot)=>{
                        if(response =="1"){
                            await bot.cancelAllDialogs();
                            await bot.beginDialog("simulacao");
                        }
                        else if(response == "2"){

                        }
                        else if(response == "3"){
                            await flow.gotoThread("transferToHuman");  
                        }
                        else{
                            flow.gotoThread("proposalValueRetry")
                        }
                    },
    "proposalInfoChoice",
    "proposalValue"
    );

    flow.addQuestion("[SOL]+++Puxa 😕 Essa opção não é válida.\
                    \nVamos tentar novamente?",
                    async(response,flow,bot)=>{
                        if(response =="1"){
                            await bot.cancelAllDialogs();
                            await bot.beginDialog("simulacao");
                        }
                        else if(response == "2"){

                        }
                        else if(response == "3"){
                            await flow.gotoThread("transferToHuman");  
                        }
                        else{
                            await flow.gotoThread("transferToHumanFail") 
                        }
                    },
    "proposalInfoChoice",
    "proposalValueRetry"
    );
    
    flow.addQuestion("[SOL]+++Entendi! Como sou uma Assistente Digital em treinamento, vou te encaminhar para um de nossos especialistas, tudo bem?\
                    \n\nPor favor, me conte em uma única mensagem qual é o assunto que você gostaria de tratar:",
                    async(response,flow,bot)=>{
                        
                        await flow.gotoThread("transferToHuman");    
                    },
                    "question",
                    "userQuestion")

    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",`Entendi! É só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                    \n\nTudo será resolvido por lá, ok!? 👩🏻‍💻`)
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
    flow.addMessage("[SOL]+++{{vars.messageTransfer}}","transferToHuman");
    
    flow.before("transferToHumanFail", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",`Puxa não consegui validar os seus dados.\
                                    \n\nÉ só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                    \n\nTudo será resolvido por lá, ok!? 👩🏻‍💻`)
                        // flow.setVar("messageTransfer",
                        //             "Puxa, a opção digitada é invalida! 😐\
                        //             \n\nMas fique tranquilo, vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa não consegui validar os seus dados e, no momento, meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \n\nRetorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH , no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("[SOL]+++{{vars.messageTransfer}}","transferToHumanFail");

    flow.after(async (results, bot) => {
        
        await bot.cancelAllDialogs();
    });
    controller.addDialog(flow);
};