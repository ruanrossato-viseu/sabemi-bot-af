module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("passiveContact", controller);
    const utils = require('../requests/utils.js');

    flow.addAction("intro");

    flow.addQuestion("[unregisteredUser]+++Olá! Eu sou a Sol, assistente digital da Sabemi 🙋🏻\
                    \n\nConsegue me contar, em uma única mensagem, qual é o assunto que você gostaria de tratar?",
        async(response, flow, bot)=>{
            console.log(response)
        },
        "subject",
        "intro"
    )

    flow.addMessage("[unregisteredUser]+++Legal! Para iniciar o seu atendimento com um Especialista, vou precisar que você me informe alguns dos seus dados pessoais\
                    \n\nMas vale ressaltar: este é um ambiente seguro e seus dados estão protegidos e guardados, tudo de acordo com a Lei Geral de Proteção de Dados (LGPD) e Direito do Consumidor 🔒",
                    "intro"
    )

    flow.addMessage("[unregisteredUser]+++Se quiser saber mais, é só clicar nesse link para acessar nossas políticas e termos sobre a Lei Geral de Proteção de Dados: 👉 https://www.sabemi.com.br/politica-de-privacidade","intro")
    
    flow.addQuestion("[unregisteredUser]+++Vamos lá!? Me conta qual é o seu nome completo?",
                    async(response,flow,bot)=>{
                        
                    },
                    "nome",
                    "intro"
    );

    flow.addQuestion("[unregisteredUser]+++Legal! Digita aqui pra mim o seu CPF",
                    async(response,flow,bot)=>{
                        await flow.gotoThread("transferToHuman")
                    },
                    "cpf",
                    "intro"
    );
    flow.before("transferToHuman", 
        async(flow,bot)=>{
            if(await utils.workingHours()){
                flow.setVar("messageTransfer",
                        `Para falar com um de nossos atendentes, é só acessar nosso suporte no link https://api.whatsapp.com/send?phone=555131037420&text=Ol%C3%A1!%20Estava%20falando%20com%20a%20Sol%20e%20preciso%20de%20ajuda.%20C%C3%B3digo:${flow.vars.user.codigo} . Tudo será resolvido por lá 😁`)
            }
            else{
                flow.setVar("messageTransfer",
                            "Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                            \nRetorne com um alô, por aqui mesmo, no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                            \nBjs e até breve")
            }
        }
    );
    flow.addMessage("[unregisteredUser]+++{{vars.messageTransfer}}","transferToHuman");
   
    
   

    flow.after(async (results, bot) => {
        await bot.cancelAllDialogs();
    });
    controller.addDialog(flow);
};