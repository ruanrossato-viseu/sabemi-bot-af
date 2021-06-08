module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("pararMenu", controller);
    const utils = require('../requests/utils.js');

    flow.addAction("menu");

    flow.addQuestion("Certo! Tudo bem! Me conta o que você prefere fazer agora:\
        \nDigita 1 para \"mudei meus planos\"\
        \nDigita 2 para \"quero falar com um especialista\" \
        \nDigita 3 para \"já contratei um Empréstimo Pessoal\"\
        \nDigita 4 para \"não quero mais ter contato com a Sabemi\"",
        async(response, flow, bot)=>{
            if(response == "1"){
                await flow.gotoThread("changeOfPlans")
            }
            else if(response == "2"){
                await flow.gotoThread("transferToHuman")                
            }
            else if(response == "3"){
                await flow.gotoThread("evaluation")
            }
            else if(response == "4"){
                await bot.say("Obrigada por me avisar!Se desejar falar com a Sabemi, é só me chamar! Basta digita SOL que estarei pronta para te atender :)")                
            }
            else{
                await bot.say("Essa opção não é válida. Digite de 1 a 4 para seguir adiante");
                await flow.repeat()                
            }

        },
        "menuChoice",
        "menu"
    )

    flow.addQuestion("Puxa, o que mudou? 😔 Me conta o motivo da sua mudança:\
                    \nDigita 1 para \"já contratei um Empréstimo Pessoal\"\
                    \nDigita 2 para \"prefiro utilizar outra forma de crédito (exemplo: cartão de crédito)\"\
                    \nDigita 3 para \"não faz mais sentido contratar um Empréstimo Pessoal\"",
                    async(response,flow,bot)=>{
                        await flow.gotoThread("evaluation")
                    },
                    "changeOfPlanesChoice",
                    "changeOfPlans"
    );

    flow.addQuestion("Obrigada por compartilhar isso comigo! Posso te pedir uma ajudinha?\
                    \nVocê poderia avaliar este atendimento?\
                    \nJuro que é rapidinho e vai me ajudar a te atender cada vez melhor 😃\
                    \nDigita 1 para: muito satisfeito\
                    \nDigita 2 para: satisfeito\
                    \nDigita 3 para: não me ajudou\
                    \nDigita 4 para: péssimo\
                    \nBj e até a próxima!",
                    async(response,flow,bot)=>{
                    },
                    "evaluation",
                    "evaluation"
    );
    
    
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
    flow.addMessage("{{vars.messageTransfer}}","transferToHuman");

    flow.after(async (results, bot) => {
        await bot.cancelAllDialogs();
    });
    controller.addDialog(flow);
};