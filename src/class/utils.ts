import { ButtonBuilder, ButtonStyle, ContainerBuilder, EmbedBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, TextDisplayBuilder } from 'discord.js'
import { existsSync } from 'node:fs'
import { setTimeout as wait } from 'node:timers/promises'

export default class Utils
{
    private readonly _appColor = 0x9B66FF;

    /**
     * Gets the default app color.
     * @returns The default app color.
     */
    getAppColor(): number
    {
        return this._appColor;
    }

    /**
     * Generates a new button with the given parameters.
     * @param customId The custom ID or URL of the button.
     * @param style The style of the button.
     * @param label The label of the button.
     * @param disabled Whether the button is disabled or not (defaults to false).
     * @returns The generated button.
     */
    buttonBuilder(customId: string, label: string, style?: ButtonStyle, disabled: boolean = false)
    {
        const button = new ButtonBuilder()
            .setLabel(label)
            .setDisabled(disabled);
        
        if (/^[a-z][a-z0-9+.-]*:\/\/[^\s]+$/i.test(customId))
        {
            button
                .setStyle(ButtonStyle.Link)
                .setURL(customId);
        }
        else
        {
            button
                .setStyle(style ?? ButtonStyle.Primary)
                .setCustomId(customId);
        }

        return button;
    }

    /**
     * Creates a container with optional accent color.
     * @param color The accent color of the container.
     * @returns The constructed container.
     */
    containerBuilder(color: number | null = null): ContainerBuilder
    {
        const container = new ContainerBuilder()
        
        if (color !== null)
        {
            container.setAccentColor(color);
        }

        return container;
    }
    
    /**
     * Creates an embed with optional title, emoji, and color.
     * @param title The title of the embed.
     * @param emoji An emoji to prefix the title.
     * @param color The embed color.
     * @returns The constructed embed.
     */
    embedBuilder(title?: string, emoji?: string, color?: number): EmbedBuilder
    {
		if (title !== undefined && emoji !== undefined)
        {
            title = `${emoji} • ${title}`;
        }
        
        return new EmbedBuilder()
        	.setColor(color ?? null)
        	.setTitle(title ?? null);
    }
    
    private readonly _embedWarning = this.embedBuilder('Warning', '⚠️', 0xFF9900);
    
    /**
     * Sends or edits an ephemeral warning message to an interaction.
     * @param interaction The Discord interaction.
     * @param description The warning message description.
     * @returns The interaction response.
     */
    interactionWarning = async (interaction: any, description: string): Promise<any> => {
        this._embedWarning
            .setDescription(description)
            .setTimestamp();
        
        const response = await interaction[(interaction.deferred ? 'editReply' : 'reply')]({
            embeds: [ this._embedWarning ],
            flags: MessageFlags.Ephemeral
        });

        return response;
    }

    private readonly _uptimeDate = Object.freeze(new Date());

    /**
     * Gets the date when the application was started.
     * @returns The uptime start date.
     */
    getUptimeDate(): Date
    {
        return this._uptimeDate;
    }

    private readonly _webhookData = Object.freeze({
        name: 'Phantasia',
        avatar: 'https://cdn.discordapp.com/attachments/1273919876855103542/1273921643755999272/phantasia.png?ex=66c05f7c&is=66bf0dfc&hm=37a992479acee740705ef73d21e3f113b1ae0aa7d15e0c277119bdf12148246c&'
    });

    /**
     * Gets an existing webhook or creates a new one in the channel.
     * @param interaction The Discord interaction.
     * @returns The webhook.
     */
    async getWebhook(interaction: any): Promise<any>
    {
        let webhook = await interaction.channel.fetchWebhooks()
            webhook = webhook.find((webhook: any) => (webhook.name === this._webhookData.name));
	
        return (webhook ? webhook : await interaction.channel.createWebhook(this._webhookData));
    }
    /**
     * Clamps a number between a minimum and maximum value.
     * @param value The number to clamp.
     * @param min  The lower bound.
     * @param max The upper bound.
     * @returns The clamped number.
     */
    clamp(value: number, min: number, max: number): number
    {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Returns a boolean based on a percentage chance.
     * @param percentage The probability of returning true (0 to 1).
     * @returns Whether the chance succeeded.
     */
    chance(percentage: number = 0.5): boolean
    {
        return (Math.random() < this.clamp(percentage, 0, 1));
    }

    /**
     * Chooses a random element from an array.
     * @param array The array to choose from.
     * @returns The randomly chosen element.
     */
    choose(array: string | any[]): any
    {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Chooses a random value based on weight.
     * @param data Array of values with weights.
     * @returns The chosen value and its index.
     */
    chooseWeight(data: { value: any; weight: number }[]): { value: any; index: number }
    {
        const totalWeight = data.reduce((sum, v) => sum + v.weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < data.length; ++i)
        {
            const { value, weight } = data[i];

            random -= weight;
    
            if (random <= 0)
            {
                return {
                    value,
                    index: i
                }
            }
        }

        return {
            value: data[0].value,
            index: 0
        }
    }

    /**
     * Formats a number with commas as thousands separators.
     * @param value The number to format.
     * @returns The formatted number as a string.
     */
    formatNumber(value: number): string
    {
        return (new Intl.NumberFormat().format(Math.floor(value))).toString();
    }

    /**
     * Returns a string with the first letter of each word capitalized.
     * @param string The string to format.
     * @returns The formatted string.
     */
    formatTitle(string: string): string
    {
        return string
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Generates a random number between 0 (inclusive) and max (exclusive).
     * @param max The maximum value.
     * @returns The generated random number.
     */
    random(max: number): number
    {
        return Math.random() * max;
    }

    /**
     * Returns a random number between min and max.
     * @param min The minimum value.
     * @param max The maximum value.
     * @returns The generated random number.
     */
    randomRange(min: number, max: number): number
    {
        return min + (Math.random() * (max - min));
    }

    /**
     * Generates a deterministic pseudo-random number from a seed.
     * @param seed The seed value.
     * @returns The generated pseudo-random number (0 to 1).
     */
    randomSeeded(seed: number): number
    {
        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;
        
        return (seed >>> 0) / 0xffff_ffff;
    }

    /**
     * Waits for the given number of seconds.
     * @param time - The time to wait in seconds.
     * @returns Resolves after the wait time.
     */
    async wait(time: number): Promise<void>
    {
        return await wait(1000 * time);
    }
}