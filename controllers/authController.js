

const userRepository = require('../repositories/userRepository')

const registerUser = async (req,res) => {
     const {fullName,email,password}=req.body
    //  validaciones
    try{
     const response= await userRepository.createUser(fullName,email,password)
    }catch(error){

    }

    }

const loginUser = async (req,res) =>{
     const {email,password}=req.body

     try{
     const response= await userRepository.getByIdUser(fullName,email,password)
    }catch(error){

    }
   
 
}