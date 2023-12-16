import FriendList from "../models/FriendList";
import Users from "../models/Users";
import { Op } from "sequelize";

// Nampilin daftar pertemanan
export const FriendList = async (req, res) => {
    try {
        const userFriendList = await FriendList.findAll({
            attributes: ['id', 'req_to', 'status'],
            where: {
                [Op.and]: [{ userId: req.params.id }, { status: 'Friend' }]
            },
            include: {
                model: Users,
                attributes: ['id', 'username', 'profile_pict', 'url']
            }
        });
        res.json(userFriendList);
    } catch (error) {
        console.log(error.message);
    }
}

// Menampilkan user yang tidak ada di dalam daftar pertemanan
export const AllUsers = async (req, res) => {
    const users = await Users.findAll({
        attributes: ['id', 'username', 'profile_pict', 'url']
    });

    try {
        const cekFriends = await FriendList.findAll({
            include: [{
                model: Users,
                attributes: ['id', 'username', 'profile_pict', 'url']
            }],
            where: {
                [Op.and]: [{ userId: req.userId }, { req_to: users.id }, { status: 'friend' }]
            }
        });
        const response = !users.includes(cekFriends);
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

// Tambah pertemanan
export const addFriend = async (req, res) => {
    try {
        await FriendList.create({
            userId: req.userId,
            req_to: req.params.id,
            status: 'pending'
        });
        res.status(200).json({ msg: 'Permintaan pertemanan terkirim!' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// daftar permintaan pertemanan
export const listReq = async (req, res) => {
    const users = await Users.findAll();
    try {
        const requestList = await FriendList.findAll({
            include: [{
                model: Users,
                attributes: ['id', 'username', 'profile_pict', 'url']
            }],
            where: {
                [Op.and]: [{ id: req.params.id }, { req_to: req.userId }, { userId: req.users.id }, { status: 'pending' }]
            }
        });
        res.status(200).json(requestList);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// konfirmasi dan tolak pertemanan
export const actFriend = async (req, res) => {

}

// cari teman yang ada di daftar pertemanan
export const findFriend = async (req, res) => {
    const username = req.body;
    try {
        const FindUser = await FriendList.findOne({
            include: [{
                model: Users,
                attributes: ['id', 'username', 'profile_pict', 'url']
            }
            ],
            where: {
                username: username
            }
        });
        res.status(200).json(FindUser);
    } catch (error) {
        console.log(error.message);
    }
}

// hapus pertemanan
export const Unfriend = async (req, res) => {
    try {
        await FriendList.destroy({
            where: {
                [Op.and]: [{ id: req.params.id }, { userId: req.userId }]
            }
        });
        res.status(200).json({ msg: 'waduh, mutus tali silaturahmi' });
    } catch (error) {
        console.log(error.message);
    }
}