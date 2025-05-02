import moogoose from 'mongoose';

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    console.log('runnnnnning dbConnect', process.env.MONGODB_URI);
    if (connection.isConnected) {
        console.log('Already connected to DB');
        return;
    }
    try {
        const db = await moogoose.connect(process.env.MONGODB_URI || '' as string, {});
        connection.isConnected = db.connections[0].readyState;
        console.log('Connected to DB');
    } catch (error) {
        console.error('Error connecting to DB:', error);
        process.exit(1);
    }
}

export default dbConnect;