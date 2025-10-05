import mongoose from 'mongoose'

// @ts-ignore
mongoose.connect(process.env?.MONGODB_URI, {
    compressors: [
        'zstd',
        'snappy',
        'zlib'
    ],
    useBigInt64: true
}).then(() => console.log('MongoDB connected!'));

export default class Model
{
    schema: any;
    model: mongoose.Model<any>;

    /**
     * @param collectionName The name of the MongoDB collection.
     * @param schema The Mongoose schema definition.
     */
    constructor(collectionName: string, schema: any)
    {
        this.schema = schema;
        this.model = mongoose.model(collectionName, schema);
    }

    /**
     * Creates a new document in the collection.
     * @param data The data to insert.
     * @param options Additional options for creation.
     * @returns The created document.
     */
    create(data?: any, options?: any): Promise<any>
    {
        return this.model.create(data, options);
    }

    /**
     * Deletes documents matching the given ID or query.
     * @param id The ID or filter query.
     * @param options Additional delete options.
     * @returns The deletion result.
     */
    delete(id: any, options?: any): Promise<any>
    {
        return this.model.deleteMany(id, options);
    }

    /**
     * Checks if a document exists by its ID.
     * @param id The ID to check.
     * @returns True if the document exists, false otherwise.
     */
    async exists(id?: any): Promise<boolean>
    {
        const user = await this.model.findOne({ _id: id }).select('_id').lean();

        return !!user;
    }

    /**
     * Fetches a single document by ID.
     * @param id The document ID.
     * @param filter The fields to return.
     * @param options Additional query options.
     * @returns The found document.
     */
    fetch(id?: string, filter?: any, options?: any): Promise<any>
    {
        return this.model.findById(id, filter, options);
    }

    /**
     * Finds multiple documents by ID.
     * @param id The document ID or query.
     * @param filter The fields to return.
     * @param options Additional query options.
     * @returns The matching documents.
     */
    find(id?: any, filter?: any, options?: any): Promise<any>
    {
        return this.model.find({ _id: id }, filter, options);
    }

    /**
     * Finds all documents matching a filter.
     * @param filter The query filter.
     * @param options Additional query options.
     * @returns The matching documents.
     */
    findAll(filter?: any, options?: any): Promise<any>
    {
        return this.model.find(filter, options);
    }

    /**
     * Finds a single document matching a filter.
     * @param id The document ID or query.
     * @param filter The fields to return.
     * @param options Additional query options.
     * @returns The found document.
     */
    findOne(id?: any, filter?: any, options?: any): Promise<any>
    {
        return this.model.findOne(id, filter, options);
    }

    /**
     * Updates a document by ID, creating it if it doesn't exist.
     * @param id The document ID.
     * @param data The data to set.
     * @returns The updated or created document.
     */
    update(id?: string, data?: any): Promise<any>
    {
        return this.model.findByIdAndUpdate(id, { $set: data }, { upsert: true });
    }
}