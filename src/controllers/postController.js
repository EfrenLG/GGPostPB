const Post = require('../models/postModel');
const Message = require('../models/messageModel');

const { getPostValidations, createPostValidations, deletePostValidations } = require('../validations/postValidations');
const { getPost, uploadFile, updateUserPost, updatePostView, updatePostLike } = require('../services/postService');


const postController = {

    getPostController: [
        ...getPostValidations,
        async (req, response) => {
            try {

                const { id } = req.params;
                const data = await getPost(id);

                response.status(200).json(data);

            } catch (e) {

                console.log('Error al recoger el post de la BBDD', e);
                response.status(500).json({ error: 'Error al recoger el post de la BBDD' });
            }
        }
    ],
    all: [
        async (req, res) => {
            try {

                const posts = await Post.find().sort({ fechaAlta: -1 });

                res.status(201).json({ status: 200, posts });
            } catch (error) {
                res.status(500).json({ error: error.message });
            };
        }],
    register: [
        ...createPostValidations,
        async (req, res) => {
            try {
                const { idUser, file, tittle, description, categories } = req.body;

                const newPost = new Post({
                    idUser,
                    file,
                    tittle,
                    description,
                    categories
                });

                await newPost.save();

                res.status(201).json({ status: 200 });
            } catch (error) {
                res.status(500).json({ error: error.message });
            };
        }],
    uploadFile: [
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
                }

                const filename = await uploadFile(req.file);
                res.status(201).json({ message: 'Archivo subido exitosamente', filename });
            } catch (error) {
                console.error('Error al subir archivo:', error);
                res.status(500).json({ error: 'Error al subir el archivo' });
            };
        }],
    delete: [
        ...deletePostValidations,
        async (req, res) => {
            try {
                const { id } = req.params;

                const post = await Post.findByIdAndDelete(id);
                if (!post) {
                    return res.status(404).json({ error: 'Post no encontrado' });
                }

                const message = await Message.deleteMany({ postId: id })
                if (!message) {
                    return res.status(404).json({ error: 'Mensaje no encontrado' });
                }

                res.status(200).json({ message: 'Post eliminado exitosamente', id });
            } catch (error) {
                console.error('Error al eliminar el post:', error);
                res.status(500).json({ error: 'Error al eliminar el post' });
            }
        }],
    uploadPost: [
        async (req, res) => {
            try {

                const { idPost, tittlePost, descriptionPost, categoriesPost } = req.body;

                if (!idPost) {
                    return res.status(400).json({ error: 'ID del post no proporcionado' });
                }

                const updatedUser = await updateUserPost(idPost, tittlePost, descriptionPost, categoriesPost);

                res.status(200).json({ message: 'Post actualizado exitosamente' });

            } catch (error) {
                console.error('Error al subir archivo:', error);
                res.status(500).json({ error: 'Error al subir el archivo' });
            };
        }],
    uploadPostView: [
        async (req, res) => {
            try {

                const { idPost } = req.body;

                if (!idPost) {
                    return res.status(400).json({ error: 'ID del post no proporcionado' });
                }

                const updatedUser = await updatePostView(idPost);

                res.status(200).json({ message: 'Post actualizado exitosamente' });

            } catch (error) {
                console.error('Error al subir archivo:', error);
                res.status(500).json({ error: 'Error al subir el archivo' });
            };
        }],
    uploadPostLike: [
        async (req, res) => {
            try {

                const { idPost, userId } = req.body;

                if (!idPost) {
                    return res.status(400).json({ error: 'ID del post no proporcionado' });
                };

                if (!userId) {
                    return res.status(400).json({ error: 'ID del usuario no proporcionado' });
                }

                const { updatedPost, action } = await updatePostLike(idPost, userId);

                res.status(200).json({
                    message: `Se ha hecho ${action} correctamente.`,
                    post: updatedPost
                });

            } catch (error) {
                console.error('Error al subir archivo:', error);
                res.status(500).json({ error: 'Error al subir el archivo' });
            };
        }],
};

module.exports = postController;