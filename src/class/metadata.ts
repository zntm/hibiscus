import type { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'

export const enum CommandCategory
{
    General = 'General',
    Fun = 'Fun',
    Utility = 'Utility'
}

class Metadata
{
    private _info: any;

    /**
     * @param info The metadata information to store.
     */
    constructor(info: any)
    {
        this._info = info;
    }

    /**
     * Gets the stored metadata information.
     * @returns The stored metadata.
     */
    getInfo()
    {
        return this._info;
    }
}

export class CommandMetadata extends Metadata
{
    private _category: string;
    private _isDeveloperCommand = false;

    /**
     * @param category The category of the command.
     * @param info The slash command data.
     */
    constructor(category: CommandCategory, info: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder)
    {
        super(info);
        this._category = category;
    }

    /**
     * Gets the category of the command.
     * @returns The command category.
     */
    getCategory()
    {
        return this._category;
    }

    /**
     * Marks this command as a developer-only command.
     */
    setIsDeveloperCommand()
    {
        this._isDeveloperCommand = true;
    }

    /**
     * Checks if this command is a developer-only command.
     * @returns Whether this command is developer-only.
     */
    getIsDeveloperCommand()
    {
        return this._isDeveloperCommand;
    }
}

export class ContextMetadata extends Metadata
{
}

export class TerminalMetadata
{
    private _channels?: string[];
    private _roles?: string[];
    private _users?: string[];

    /**
     * Adds a value or list of values to a specific type property.
     * @param value The value(s) to add.
     * @param type The property name to store the values in.
     * @returns This instance for chaining.
     * @private
     */
    private _addValue(value: string | string[], type: string)
    {
        this[type] ??= [];

        if (Array.isArray(value))
        {
            // @ts-ignore
            this[type].push(...value);
        }
        else
        {
            // @ts-ignore
            this[type].push(value);
        }

        return this;
    }

    /**
     * Checks if the given value exists in a specific type property.
     * @param value The value(s) to check.
     * @param type The property name to check.
     * @returns Whether the value exists.
     * @private
     */
    private _hasValue(value: string | string[], type: string)
    {
        // @ts-ignore
        if (!this[type])
        {
            return true;
        }

        return (typeof value === 'string' ? this[type].includes(value) : value.some((v) => this[type].includes(v)));
    }

    /**
     * Adds one or more allowed channels.
     * @param channel The channel(s) to allow.
     * @returns This instance for chaining.
     */
    addChannel(channel: string | string[])
    {
        return this._addValue(channel, '_channels');
    }

    /**
     * Checks if a channel is allowed.
     * @param channel The channel(s) to check.
     * @returns Whether the channel is allowed.
     */
    hasChannel(channel: string | string[])
    {
        return this._hasValue(channel, '_channels');
    }

    /**
     * Gets the list of allowed channels.
     * @returns The allowed channels.
     */
    getChannels()
    {
        return this._channels;
    }

    /**
     * Adds one or more allowed roles.
     * @param role The role(s) to allow.
     * @returns This instance for chaining.
     */
    addRole(role: string | string[])
    {
        return this._addValue(role, '_roles');
    }

    /**
     * Checks if a role is allowed.
     * @param role The role(s) to check.
     * @returns Whether the role is allowed.
     */
    hasRole(role: string | string[])
    {
        return this._hasValue(role, '_roles');
    }

    /**
     * Gets the list of allowed roles.
     * @returns The allowed roles.
     */
    getRoles()
    {
        return this._roles;
    }

    /**
     * Adds one or more allowed users.
     * @param user The user(s) to allow.
     * @returns This instance for chaining.
     */
    addUser(user: string | string[])
    {
        return this._addValue(user, '_users');
    }

    /**
     * Checks if a user is allowed.
     * @param user The user(s) to check.
     * @returns Whether the user is allowed.
     */
    hasUser(user: string | string[])
    {
        return this._hasValue(user, '_user');
    }

    /**
     * Gets the list of allowed users.
     * @returns The allowed users.
     */
    getUsers()
    {
        return this._users;
    }
}
