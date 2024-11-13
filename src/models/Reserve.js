import {Schema, model} from "mongoose";

const ReserveSchema = new Schema({
    date: String,
    use: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    house:{
        type: Schema.Types.ObjectId,
        ref: 'House'
    }
});

export default model('Reserve', ReserveSchema);

