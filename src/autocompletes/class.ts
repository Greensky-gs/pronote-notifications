import { AutocompleteListener, log4js } from "amethystjs";
import { getDayName, getMonthName } from "../utils/date";

export default new AutocompleteListener({
    listenerName: 'cours',
    commandName: [{ commandName: 'cours' }],
    run: async({ focusedValue, interaction }) => {
        const cours = await interaction.client.session.timetable(new Date(), new Date(Date.now() + 259200000)).catch(log4js.trace)
        if (!cours) return [];

        const response = cours.map((c) => ({ value: c.id, name: `${c.subject.toLowerCase()} - ${getDayName(c.from.getDay())} ${c.from.getDate()} ${getMonthName(c.from.getMonth())}` })).filter(x => x.name.toLowerCase().includes(focusedValue.toLowerCase()) || focusedValue.toLowerCase().includes(focusedValue.toLowerCase()));
        return response;
    }
})