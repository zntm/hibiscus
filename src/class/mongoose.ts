import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface CollectionSchema {
    table: string;
    columns: Record<string, string>;
}

const supabaseUrl =
    Bun.env?.SUPABASE_URL ??
    Bun.env?.NEXT_PUBLIC_SUPABASE_URL ??
    "";
const supabaseKey =
    Bun.env?.SUPABASE_SECRET_KEY ??
    Bun.env?.NEXT_PUBLIC_SUPABASE_SECRET_KEY ??
    Bun.env?.SUPABASE_PUBLISHABLE_KEY ??
    Bun.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    "";

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials are missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
    },
});

const isObject = (value: unknown) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export default class Model {
    client: SupabaseClient;
    schema: CollectionSchema;

    constructor(collectionName: string, schema: CollectionSchema) {
        if (!schema?.table) {
            throw new Error(
                `Missing Supabase schema definition for collection "${collectionName}".`,
            );
        }

        this.client = supabase;
        this.schema = schema;
    }

    private getColumn(field: string) {
        return field === "_id" ? "id" : (this.schema.columns[field] ?? field);
    }

    private getField(column: string) {
        if (column === "id") return "_id";

        const entry = Object.entries(this.schema.columns).find(([, value]) =>
            value === column
        );

        return entry?.[0] ?? column;
    }

    private getSelectColumns(filter?: Record<string, any>) {
        if (!filter || Object.keys(filter).length === 0) {
            return "id,*";
        }

        const columns = new Set<string>(["id"]);

        for (const [field, enabled] of Object.entries(filter)) {
            if (enabled) {
                columns.add(this.getColumn(field));
            }
        }

        return [...columns].join(",");
    }

    private toDocument(row: Record<string, any> | null | undefined) {
        if (!row) return null;

        const document: Record<string, any> = {
            _id: row.id,
        };

        for (const [key, value] of Object.entries(row)) {
            if (key === "id" || value === undefined) continue;

            document[this.getField(key)] = value;
        }

        return document;
    }

    private toRow(data?: Record<string, any>) {
        if (!data) return {};

        const row: Record<string, any> = {};

        for (const [field, value] of Object.entries(data)) {
            if (value === undefined) continue;

            row[this.getColumn(field)] = value;
        }

        return row;
    }

    private applyQuery<T>(query: T, filter?: any): T {
        if (!filter) return query;

        if (!isObject(filter)) {
            // @ts-ignore
            return query.eq("id", filter);
        }

        let scopedQuery: any = query;

        for (const [field, value] of Object.entries(filter)) {
            if (value === undefined) continue;

            scopedQuery = scopedQuery.eq(this.getColumn(field), value);
        }

        return scopedQuery;
    }

    private async unwrap<T>(promise: PromiseLike<{ data: T; error: any }>) {
        const { data, error } = await promise;

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    create(data?: any): Promise<any> {
        const row = this.toRow(data);

        return this.unwrap(
            this.client.from(this.schema.table).insert(row).select().maybeSingle(),
        ).then((value) => this.toDocument(value));
    }

    async delete(id: any): Promise<any> {
        const query = this.applyQuery(
            this.client.from(this.schema.table).delete().select("id"),
            isObject(id) ? id : { _id: id },
        );
        const data = await this.unwrap(query);

        return data.map((entry: any) => this.toDocument(entry));
    }

    async exists(id?: any): Promise<boolean> {
        const data = await this.unwrap(
            this.client
                .from(this.schema.table)
                .select("id")
                .eq("id", id)
                .limit(1),
        );

        return data.length > 0;
    }

    fetch(id?: string, filter?: any): Promise<any> {
        return this.findOne({ _id: id }, filter);
    }

    async find(id?: any, filter?: any): Promise<any> {
        const data = await this.unwrap(
            this.applyQuery(
                this.client
                    .from(this.schema.table)
                    .select(this.getSelectColumns(filter)),
                isObject(id) ? id : { _id: id },
            ),
        );

        return data.map((entry: any) => this.toDocument(entry));
    }

    async findAll(filter?: any): Promise<any> {
        const data = await this.unwrap(
            this.applyQuery(
                this.client.from(this.schema.table).select("id,*"),
                filter,
            ),
        );

        return data.map((entry: any) => this.toDocument(entry));
    }

    async findOne(id?: any, filter?: any): Promise<any> {
        const data = await this.unwrap(
            this.applyQuery(
                this.client
                    .from(this.schema.table)
                    .select(this.getSelectColumns(filter))
                    .limit(1)
                    .maybeSingle(),
                isObject(id) ? id : { _id: id },
            ),
        );

        return this.toDocument(data);
    }

    async update(id?: string, data?: any): Promise<any> {
        const row = {
            id,
            ...this.toRow(data),
        };

        const updated = await this.unwrap(
            this.client
                .from(this.schema.table)
                .upsert(row, { onConflict: "id" })
                .select("id,*")
                .maybeSingle(),
        );

        return this.toDocument(updated);
    }
}
