import { ApplicationCommandData, ApplicationCommandType, Client, Collection, Interaction, Message, Snowflake } from "discord.js";
import { Model } from 'mongoose'

export type ExecuteParameters = {
    client: SettClient;
    message: Message;
    args: string[];
}

export interface commandBase {
    name: string
    aliases?: string[]
    category: string
    description: string
    usage: string
    examples: string
    execute(p: ExecuteParameters): any
}

export declare class SettClient extends Client {
    /** A collection containing all commands */
    public commands: Collection<string, commandBase>;

    /** A collection containing all categories and the commands inside that category */
    public categories: Collection<string, string[]>;

    /** A collection containing all cached userInfo */
    public userInfoCache: Collection<Snowflake, UserInfo>;

    /** A reference to the guildSchema */
    public DBUser: Model<UserInfo>;

    /** A reference for the duellers */
    public duelInfo: Collection<Snowflake, duellerInfo>

    /** A reference for the duel channel */
    public duelChannel: Collection<Snowflake, boolean>

    public modMail: Collection<Snowflake, boolean>
}

interface UserInfo {
    _id: string
    balance: number
    win: number,
    hourly: Date,
    daily: Date
}

interface duellerInfo {
    hp: number,
    defence: boolean,
    heal: number
}