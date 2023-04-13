import { AmethystEvent, log4js } from "amethystjs";
import { checkDatabase } from "../utils/checkDb";
import { PronoteStudentSession, login } from "pronote-api-maintained";
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { Cache } from "../managers/cache";

export default new AmethystEvent('ready', async(client) => {
    await checkDatabase();

    const session = await login('https://0310047h.index-education.net/pronote', process.env.prnusername, process.env.password, 'ac-toulouse');
    const channel = await client.channels.fetch(process.env.channelId) as TextChannel;

    console.log("[*] Session and channel logged in")

    if (!channel) {
        throw new Error("Salon introuvable")
    }

    if (!session) {
        throw new Error("Session introuvable");
    }

    client.session = session;

    session.setKeepAlive(true, log4js.trace)
    const cache = new Cache();

    const fetchMarks = async() => {
        const marks = await session.marks({
            from: new Date('2022-09-02T00:00:00'),
            to: new Date(),
            notationPeriod: 0,
            type: 'year',
            name: "",
            id: ""
        }).catch(log4js.trace);
        if (!marks) return;
    
        marks.subjects.forEach((subject) => {
            subject.marks.filter(x => !cache.isMarkCached(x.id)).forEach((mark) => {
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Nouvelle note")
                            .setColor(subject.color as ColorResolvable)
                            .setAuthor({ name: `${subject.name} - ${mark.title}`.substring(0, 49) })
                            .setDescription(`Vous avez eu \`${mark.value ?? 'abs'}/${mark.scale ?? '20'}\``)
                            .setFields(
                                {
                                    name: "Moyenne",
                                    value: `\`${mark.average ?? 'abs'}/${mark.scale ?? '20'}\``,
                                    inline: true
                                },
                                {
                                    name: "Note max",
                                    value: `\`${mark.max ?? 'abs'}/${mark.scale}\``,
                                    inline: true
                                },
                                {
                                    name: "Note min",
                                    value: `\`${mark.min ?? 'abs'}/${mark.scale}\``,
                                    inline: true
                                }
                            )
                            .setTimestamp(mark.date)
                    ],
                    content: `<@${process.env.userId}>`
                }).catch(log4js.trace);
    
                cache.addMark(mark.id);
            })
        })
    }
    const fetchHomeworks = async() => {
        const works = await session.homeworks(new Date(new Date().setHours(0)), new Date(new Date(new Date().setHours(23, 59)).getTime() + 2419200000)).catch(log4js.trace);
        if (!works) return;

        works.filter((w) => !cache.isWorkCached(w.id)).forEach(async(work) => {
            const workFor = (work.for.getTime() / 1000).toFixed(0)
            cache.addWork(work.id);

            const msg = await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTimestamp(work.for)
                        .setAuthor({ name: "Nouveau devoir" })
                        .setTitle(work.subject)
                        .setColor(work.color as ColorResolvable)
                        .setDescription(work.description)
                        .setFields({
                            name: "Donné",
                            value: `Donné <t:${(work.givenAt.getTime() / 1000).toFixed(0)}:R>`,
                            inline: true
                        }, {
                            name: "Pour",
                            value: `<t:${workFor}:F> ( <t:${workFor}:R> )`
                        })
                ],
                content: `<@${process.env.userId}>`
            }).catch(log4js.trace);

            if (msg) {
                msg.react('✅').catch(log4js.trace)
            };
        })
    }
    const fetchCommunications = async() => {
        const coms = await session.infos().catch(log4js.trace);
        console.log(coms)
        if (!coms) return;

        coms.filter(x => !cache.isInfoCached(x.id)).forEach((com) => {
            channel.send({
                embeds: [
                    new EmbedBuilder(
                        {
                            footer: com.files.length > 0 ? { text: `${com.files.length} fichiers` } : undefined
                        }
                    )
                        .setTitle("Nouveau message")
                        .setAuthor({ name: com.author ?? 'Inconnu' })
                        .setTimestamp(com.date)
                        .setColor('Orange')
                        .setDescription(com.content)
                ],
                content: `<@${process.env.userId}>`
            }).catch(log4js.trace);

            cache.addInfo(com.id);
        })
    }
    const fetchClasses = async() => {
        const cours = await session.timetable(new Date(), new Date(new Date().setHours(7) + 172800000))
        if (!cours) return log4js.trace("Cours inaccessibles");

        cours.filter(c => !cache.isCoursCached(c.id)).forEach((cours) => {
            cache.addCours(cours.id);
            if (cours.isCancelled || cours.isAway) {
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Cours annulé")
                            .setDescription(`Le cours de ${cours.subject ?? 'Inconnu'} de <t:${(cours.from.getTime() / 1000).toFixed(0)}:F> à <t:${(cours.to.getTime() / 1000).toFixed(0)}:F> le ${cours.from.getDay()} a été annulé`)
                            .setColor((cours.color ?? 'Orange') as ColorResolvable)
                            .setTimestamp(cours.from)
                    ],
                    content: `<@${process.env.userId}>`
                }).catch(log4js.trace)
            }
            if (cours.hasDuplicate) {
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Cours remplacé")
                            .setDescription(`Un cours a été ajouté à la place du cours de ${cours.subject} de <t:${(cours.from.getTime() / 1000).toFixed(0)}:F> à <t:${(cours.to.getTime() / 1000).toFixed(0)}:F> le ${cours.from.getDay()}`)
                            .setColor((cours.color ?? 'Orange') as ColorResolvable)
                            .setTimestamp(cours.from)
                    ],
                    content: `<@${process.env.userId}>`
                }).catch(log4js.trace)
            }
        })
    }

    setInterval(() => {
        fetchMarks();
        fetchHomeworks();
        fetchCommunications();
        fetchClasses();
    }, 300000)
})

declare module 'discord.js' {
    interface Client {
        session: PronoteStudentSession;
    }
}