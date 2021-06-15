module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("pararMenu", controller);
    const utils = require('../requests/utils.js');

    flow.addAction("menu");

    flow.addQuestion("[PARAR]+++Certo! Tudo bem! Me conta o que você prefere fazer agora:\
        \n\nDigite 1 para \"mudei meus planos\"\
        \nDigite 2 para \"quero falar com um especialista\" \
        \nDigite 3 para \"já contratei um Empréstimo Pessoal\"\
        \nDigite 4 para \"não quero mais ter contato com a Sabemi\"",
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
                await bot.say("[PARAR]+++Obrigada por me avisar!\nSe desejar falar com a Sabemi, é só me chamar! Basta digitar SOL que estarei pronta para te atender :)")   
                await flow.gotoThread("evaluation")             
            }
            else{
                await bot.say("[PARAR]+++Essa opção não é válida. Digite de 1 a 4 para seguir adiante");
                await flow.repeat()                
            }

        },
        "menuChoice",
        "menu"
    )

    flow.addQuestion("[PARAR]+++Puxa, o que mudou? 😔 Me conta o motivo da sua mudança:\
                    \n\nDigite 1 para \"já contratei um Empréstimo Pessoal\"\
                    \nDigite 2 para \"prefiro utilizar outra forma de crédito (exemplo: cartão de crédito)\"\
                    \nDigite 3 para \"não faz mais sentido contratar um Empréstimo Pessoal agora\"",
                    async(response,flow,bot)=>{
                        await flow.gotoThread("evaluation")
                    },
                    "changeOfPlanesChoice",
                    "changeOfPlans"
    );

    flow.addQuestion("[PARAR]+++Obrigada por compartilhar isso comigo! Posso te pedir uma ajudinha?\
                    \nVocê poderia avaliar este atendimento?\
                    \nJuro que é rapidinho e vai me ajudar a te atender cada vez melhor 😃\
                    \n\nDigite 1 para: muito satisfeito\
                    \nDigite 2 para: satisfeito\
                    \nDigite 3 para: não me ajudou\
                    \nDigite 4 para: péssimo\
                    \nBj e até a próxima!",
                    async(response,flow,bot)=>{
                    },
                    "evaluation",
                    "evaluation"
    );

    flow.addMessage("[PARAR]+++Obrigada! Se precisar falar comigo, é só digitar \"Sol\"\
                    \nBj e até a próxima!",
                    "evaluation"
    );
    
    
    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",
                        `Para falar com um de nossos atendentes, é só acessar nosso suporte no link https://api.whatsapp.com/send?phone=555131037420&text=Ol%C3%A1!%20Estava%20falando%20com%20a%20Sol%20e%20preciso%20de%20ajuda.%20C%C3%B3digo:${flow.vars.user.codigo} . Tudo será resolvido por lá 😁`)
                        
                        // flow.setVar("messageTransfer",
                        //             "[PARAR]+++Entendi! Vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "[PARAR]+++Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
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