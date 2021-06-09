module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("solMenu", controller);
    const utils = require('../requests/utils.js');

    flow.addAction("intro");

    flow.addQuestion("[SOL]+++Olá 🙋🏻 Olha, por aqui eu posso te ajudar com:\
                    \nDigite 1 para Link do APP Sabemi\
                    \nDigite 2 para dúvida sobre minha simulação\
                    \nDigite 3 para já executei o processo no APP Sabemi\
                    \nDigite 4 para Outros",
        async(response, flow, bot)=>{
            if(response == "1"){
                await bot.say("[SOL]+++Ok! Aqui está o link do APP Sabemi Digital 📲 [Link para Download APP]\
                \nLembrando que é através dele que você dará continuidade na sua contratação e ficará ainda mais perto de realizar os seus sonhos!")
                await flow.gotoThread("menu")        
            }
            else if(response == "2"){
                await flow.gotoThread("proposalInfo")                
            }
            else if(response == "3"){
                await bot.say("[SOL]+++Então, se você já fez o processo de formalização digital no APP Sabemi, meus colegas devem estar cuidando e analisando sua proposta agora mesmo!\
                            \nE o legal é que no APP Sabemi você consegue acompanhar o status da sua proposta, mas, se desejar falar com algum dos nossos especialistas, você tem um jeito fácil: basta digitar 1 para que eles entrem em contato 😊")
                await flow.gotoThread("menu")        
            }
            else if(response == "4"){
                await bot.say("[SOL]+++Como sou uma Assistente Digital em treinamento, não consigo responder todas as dúvidas. Então vou te encaminhar para um de nossos especialistas, tudo bem?\
                            \nDigite aqui qual a sua dúvida, por favor");       
                await flow.gotoThread("transferToHuman");            
            }
            else{
                await bot.say("[SOL]+++Essa opção não é válida. Digite de 1 a 4 para seguir adiante");
                await flow.repeat()                
            }
        },
        "menuChoice",
        "intro"
    )

    flow.addQuestion("[SOL]+++Com o que posso ajudar agora?:\
                    \nDigite 1 para Link do APP Sabemi\
                    \nDigite 2 para dúvida sobre minha simulação\
                    \nDigite 3 para já executei o processo no APP Sabemi\
                    \nDigite 4 para Outros\
                    \nDigite 5 para finalizar",
        async(response, flow, bot)=>{
            if(response == "1"){
                await bot.say("[SOL]+++Ok! Aqui está o link do APP Sabemi Digital 📲 [Link para Download APP]\
                \nLembrando que é através dele que você dará continuidade na sua contratação e ficará ainda mais perto de realizar os seus sonhos!")
            }
            else if(response == "2"){
                await flow.gotoThread("proposalInfo")                
            }
            else if(response == "3"){
                await bot.say("[SOL]+++Então, se você já fez o processo de formalização digital no APP Sabemi, meus colegas devem estar cuidando e analisando sua proposta agora mesmo!\
                            \nE o legal é que no APP Sabemi você consegue acompanhar o status da sua proposta, mas, se desejar falar com algum dos nossos especialistas, você tem um jeito fácil: basta digitar 1 para que eles entrem em contato 😊")
            }
            else if(response == "4"){
                await bot.say("[SOL]+++Como sou uma Assistente Digital em treinamento, não consigo responder todas as dúvidas. Então vou te encaminhar para um de nossos especialistas, tudo bem?\
                            \nDigite aqui qual a sua dúvida, por favor");       
                await flow.gotoThread("transferToHuman");            
            }
            else{
                await bot.say("[SOL]+++Essa opção não é válida. Digite de 1 a 4 para seguir adiante");
                await flow.repeat()                
            }
        },
        "menuChoice",
        "menu"
    )

    flow.addQuestion("[SOL]+++Vamos lá! Sobre sua proposta 12345:\
                    \nDigite 1 se sua dúvida for sobre valores\
                    \nDigite 2 se você deseja falar com algum de nossos especialistas 😊",
                    async(response,flow,bot)=>{
                        if(response =="1"){

                        }
                        else if(response == "2"){
                            await flow.gotoThread("transferToHuman");  
                        }
                        else{
                            await bot.say("[SOL]+++Essa opção não é válida. Digite de 1 ou 2 para seguir adiante");
                            await flow.repeat()  
                        }
                    },
                    "proposalInfoChoice",
                    "proposalInfo"
    );
    
    flow.addQuestion("[SOL]+++Verifiquei aqui que o valor da sua proposta é de\
                    \nR$xx.xxx,xx em y parcelas\
                    \nDigite 1 para seguir a contratação de Empréstimo Pessoal\
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

                        }
                    },
    "proposalInfoChoice",
    "proposalInfo"
    );
    
    
    flow.addAction("menu","proposalInfo")

    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",
                                    "[SOL]+++Entendi! Vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "[SOL]+++Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \nRetorne com um alô, por aqui mesmo, no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("{{vars.messageTransfer}}","transferToHuman");

    flow.after(async (results, bot) => {
        await bot.cancelAllDialogs();
    });
    controller.addDialog(flow);
};