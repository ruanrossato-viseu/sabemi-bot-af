module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("passiveContact", controller);
    const utils = require('../requests/utils.js');

    function isNumeric(num){
        return !isNaN(num)
      }

    flow.addAction("intro");

    flow.before("intro",async(flow,bot)=>{
        console.log("Passive")
        console.log(flow.vars.user)
        flow.setVar("retry",0);
    })

    flow.addQuestion("[unregisteredUser]+++Olá! Eu sou a Sol, assistente digital da Sabemi 🙋🏻‍♀‍\
                    \n\nConsegue me contar, em uma única mensagem, qual é o assunto que você gostaria de tratar?",
        async(response, flow, bot)=>{
        },
        "subject",
        "intro"
    )

    flow.addMessage("[unregisteredUser]+++Legal! Para iniciar o seu atendimento com um Especialista, vou precisar que você me informe alguns dos seus dados pessoais\
                    \n\nMas vale ressaltar: este é um ambiente seguro e seus dados estão protegidos e guardados, tudo de acordo com a Lei Geral de Proteção de Dados (LGPD) e Direito do Consumidor 🔒",
                    "intro"
    )

    flow.addMessage("[unregisteredUser]+++Se quiser saber mais, é só clicar nesse link para acessar nossas políticas e termos sobre a Lei Geral de Proteção de Dados: \
                    \n👉 https://www.sabemi.com.br/politica-de-privacidade","intro")
    
    flow.addQuestion("[unregisteredUserName]+++Vamos lá!? Me conta qual é o seu nome completo?",
                    async(response,flow,bot)=>{
                        console.log(response)
                        await bot.say("[UPDATEUSERNAME]+++"+response)                        
                    },
                    "nome",
                    "intro"
    );

    flow.addQuestion("[unregisteredUserID]+++Legal! Digita aqui pra mim o seu CPF",
        async(response,flow,bot)=>{
            await bot.say("[userInfo]+++Estou validando seus dados")

            if(!isNumeric(response)){  
                if(flow.vars.retry == 0){
                    await bot.say("[userInfo]+++Ops! Não foi possível validar esta informação.\
                                \nDigite *apenas os números* do seu CPF!");
                    flow.setVar("retry",1);

                    await flow.repeat()
                }
                else if(flow.vars.retry == 1){
                    if(await utils.workingHours()){
                        await bot.say(`[userInfo]+++Puxa! Não consegui validar os seus dados.\
                                            \n\nVou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗`)
                                        }
                    else{
                        await bot.say("[userInfo]+++Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente.\
                                \n\nRetorne com um alô, por aqui mesmo, no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira*, e estaremos prontos para te ajudar!\
                                \n\nBjs e até breve");
                    }  
                    
                    await bot.say("[TRANSFER]+++[Transferência Prevista]");
                }  
            }
        },
        "cpf",
        "intro"
    );
    flow.before("transferToHuman", 
        async(flow,bot)=>{
            if(await utils.workingHours()){
                flow.setVar("messageTransfer",
                        `Estamos quase lá! Estou checando as suas informações e em breve você será atendido por um de nossos especialistas 👩🏻‍💻`)
            }
            else{
                flow.setVar("messageTransfer",
                            "Estamos quase lá! ⏱ Mas no momento meus colegas estão fora do horário de atendimento, a sua mensagem está aqui guardada com a gente.\
                            \n\nRetorne com um alô, por aqui mesmo, no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira*, e estaremos prontos para te ajudar!\
                            \n\nBjs e até breve")
            }
        }
    );
    flow.addMessage("[unregisteredUser]+++{{vars.messageTransfer}}","transferToHuman");
    flow.addMessage("[TRANSFER]+++[Transferência Prevista]","transferToHuman");
   
    
   

    flow.after(async (results, bot) => {
        await bot.cancelAllDialogs();
    });
    controller.addDialog(flow);
};