import { error } from 'console';
import House from '../models/House';
import User from '../models/User';
import * as Yup from 'yup';
import fs from 'fs';
import path from 'path';

class HouseController{

    async index(req, res){
      const {status} = req.query;

      const houses = await House.find({status});

      return res.json(houses);
    }


    async store(req, res){

        const schema = Yup.object().shape({
            description: Yup.object().required(),
            price: Yup.number().required(),
            location: Yup.string().required(),
            status: Yup.boolean().required(),
        });

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }   
        const { filename } = req.file
        const {description, price, location, status} = req.body;
        const {user_id} = req.headers;

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Falha na validação'})
        }

        const house = await House.create({
            user: user_id,
            thumbnail: filename,
          //todos que estao sem : significa que é o mesmo nome usado no model
            description,
            price,
            location,
            status,
        });

        return res.status(201).json(house);
    }

    async update(req, res){

        const schema = Yup.object().shape({
            description: Yup.object().required(),
            price: Yup.number().required(),
            location: Yup.string().required(),
            status: Yup.boolean().required(),
        });

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const { filename } = req.file
        const {description, price, location, status} = req.body
        const {user_id} = req.headers
        const { house_id } = req.params;
        
        const user = await User.findById(user_id);
        
        const houses = await House.findById(house_id);

        if(String (user._id) !== String(houses.user)){
            return res.status(401).json({error: "Não autorizado."});
        }
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Falha na validação.'})
        }
        
        await House.updateOne({_id: house_id}, {
            user: user_id,
            thumbnail: filename,
          //todos que estao sem : significa que é o mesmo nome usado no model
            description,
            price,
            location,
            status,
        })
        
        return res.send()
    }

    async destroy(req, res){
        const { user_id } = req.headers;
        const { house_id } = req.body;
       
        const user = await User.findById(user_id);
        
        const house = await House.findById(house_id);

        if(String(user._id) !== String(house.user)){
            return res.status(401).json({error: "Não autorizado"});
        }

        if(!house_id){
            return res.status(404).json({error: "Casa não encontrada"})
        }
        const imagePath = path.join(__dirname, '..', '..', 'uploads', house.thumbnail);

        try {
             fs.unlinkSync(imagePath);
        } catch (err) {
             console.error('Erro ao deletar a imagem:', err);
            }
        
        await House.findByIdAndDelete({_id: house_id});

        return res.json({message: "Excluida com sucesso"});
    }
}

export default new HouseController();