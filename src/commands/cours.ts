import { AmethystCommand, log4js } from "amethystjs";
import { ApplicationCommandOptionType, ColorResolvable, EmbedBuilder } from "discord.js";
import { getDayName, getMonthName, secondsToWeeks } from "../utils/date";

export default new AmethystCommand({
    name: "cours",
    description: "Affiche les informations d'un cours",
    options: [
        {
            name: 'cours',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: "Cours que vous voulez voir",
            autocomplete: true
        }
    ]
}).setChatInputRun(async({ interaction, options }) => {
    const classId = options.getString('cours')
    await interaction.deferReply().catch(log4js.trace);

    const Cours = await interaction.client.session.timetable(new Date(), new Date(Date.now() + 259200000)).catch(log4js.trace)
    if (!Cours) return interaction.editReply({
        content: ":x: Les cours n'ont pas pu être chargés"
    }).catch(log4js.trace);

    const cours = Cours.find(x => x.id === classId);
    if (!cours) return interaction.editReply(`:x: Le cours n'a pas été trouvé`)

    let homeworks = await interaction.client.session.homeworks(new Date(), new Date(Date.now() + 2419200000)).catch(log4js.trace);
    if (!homeworks) homeworks = [];

    const embed = new EmbedBuilder()
        .setTitle((cours.subject ?? 'Inconnu').toLowerCase())
        .setColor((cours.color ?? 'Orange') as ColorResolvable)
        .setTimestamp(cours.from)
        .setDescription(`Cours de ${(cours.subject ?? 'Inconnu').toLowerCase()} en salle ${cours.room ? cours.room.split('').filter(x => x.match(/\d/)).join('') : 'inconnue'}\nLe ${getDayName(cours.from.getDay())} ${cours.from.getDate()} ${getMonthName(cours.from.getMonth())}, pendant ${secondsToWeeks(Math.floor(((cours.to.getTime() - cours.from.getTime()) / 1000)))}${cours.status !== undefined ? `\n${cours.status}` : ''}`)
        .setFields(
            {
                name: "Devoirs à faire",
                value: (homeworks ?? []).filter(x => x.subject === cours.subject).length > 0 ? `${(homeworks ?? []).filter(x => x.subject === cours.subject).length.toLocaleString('fr')} devoirs à faire` : 'Aucun devoirs à faire',
                inline: true
            }
        )
    if (cours.hasDuplicate) embed.addFields({
        name: "Cours dupliqué",
        value: "Ce cours est dupliqué. Veillez à avoir le bon cours sous les yeux. Il se peut que ce cours soit remplacé"
    })

    interaction.editReply({
        embeds: [ embed ]
    }).catch(log4js.trace)
})