const { executionAsyncResource } = require('async_hooks');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const { YTSearcher } = require('ytsearcher');

const searcher = new YTSearcher({
    key: "AIzaSyD0d7kHFdnAlN0V3dLPiU4WhtxJivGa1UI",
    revealed: true
});

const client = new Discord.Client();

const queue = new Map();

client.on("ready", () => {
    console.log("I am online!")
})

client.on("message", async function (msg) {
    if (msg.content.startsWith("/av")) {
        const embed = new Discord.MessageEmbed({
            title: "Looking kinda cute my guy",
            image: {
                url: msg.author.avatarURL()
            }
        })

        await msg.channel.send(embed);
    }
});

client.on('message', msg => {
    if (msg.content === '/bitch') {
        msg.reply("<@643918287507292187> Thats a good example.");
    }
  });

  client.on('message', msg => {
    if (msg.content === '/bitch 2') {
        msg.reply("<@429019728162324502> Thats another good example.");
    }
  });

  client.on('message', msg => {
    if (msg.content === '/british bitch') {
        msg.reply("<@281755913571008512> That would be him.");
    }
  });

  client.on('message', msg => {
    if (msg.content === '/april') {
        msg.reply("<@505294688991969299> iii here we goo i rlly like ur vibes and i like how u didn’t pressure me into anything. once u first texted me and we started texting and shi. i like how ur always ina good mood and never lets anything bring yhu down. i love how ur always so excited to talk to me and call me. i love ur personality. i rlly like how pretty you are. u like my princess. there’s more but ima cut it short. ik it’s only been 4 days. but i feel like i known for 4 months and i can’t wait until this quarantine is over so we can actually link. cuz i can’t wait to see yhu. so i have yhu in my arms. and yhu by my side :heart: :heart:.");
    }
  });

client.on("message", async(message) => {
    const prefix = '/';

    const serverQueue = queue.get(message.guild.id);

    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    client.on("ready", function () {
        console.log(`Logged in as ${client.user.tag}`);
    })

    switch(command){
        case 'play':
            execute(message, serverQueue);
            break;
        case 'stop':
            stop(message, serverQueue);
            break;
        case 'skip':
            skip(message, serverQueue);
            break;
        case 'pause':
            pause(serverQueue);
            break;
        case 'resume':
            resume(serverQueue);
            break;
    }

    async function execute(message, serverQueue){
        let vc = message.member.voice.channel;
        if(!vc){
            return message.channel.send("Please join a voice chat first");
        }else{
            let result = await searcher.search(args.join(" "), { type: "video" })
            const songInfo = await ytdl.getInfo(result.first.url)

            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };

            if(!serverQueue){
                const queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: vc,
                    connection: null,
                    songs: [],
                    volume: 10,
                    playing: true
                };
                queue.set(message.guild.id, queueConstructor);

                queueConstructor.songs.push(song);

                try{
                    let connection = await vc.join();
                    queueConstructor.connection = connection;
                    play(message.guild, queueConstructor.songs[0]);
                }catch (err){
                    console.error(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(`Unable to join the voice chat ${err}`)
                }
            }else{
                serverQueue.songs.push(song);
                return message.channel.send(`The song has been added ${song.url}`);
            }
        }
    }
    function play(guild, song){
        const serverQueue = queue.get(guild.id);
        if(!song){
            serverQueue.vChannel.leave();
            queue.delete(guild.id);
            return;
        }
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () =>{
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            serverQueue.txtChannel.send(`Now playing ${serverQueue.songs[0].url}`)
    }
    function stop (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first!")
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
    function skip (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first");
        if(!serverQueue)
            return message.channel.send("There is nothing to skip!");
        serverQueue.connection.dispatcher.end();
    }
    function pause(serverQueue){
        if(!serverQueue.connection)
            return message.channel.send("There is no music currently playing!");
        if(!message.member.voice.channel)
            return message.channel.send("You are not in the voice channel!")
        if(serverQueue.connection.dispatcher.paused)
            return message.channel.send("The song is already paused");
        serverQueue.connection.dispatcher.pause();
        message.channel.send("The song has been paused!");
    }
    function resume(serverQueue){
        if(!serverQueue.connection)
            return message.channel.send("There is no music currently playing!");
        if(!message.member.voice.channel)
            return message.channel.send("You are not in the voice channel!")
        if(serverQueue.connection.dispatcher.resumed)
            return message.channel.send("The song is already playing!");
        serverQueue.connection.dispatcher.resume();
        message.channel.send("The song has been resumed!");
        
    }
})

client.login("Nzg3MjY0NzIyMDMwNDI4MTcw.X9SbaA.Izu1iE3tTN29K3vNhuSPrPFvIwE")