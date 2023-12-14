import FriendList from "../models/FriendList";
import Users from "../models/Users";
import { Op } from "sequelize";

export const FriendList = async (req, res) => {
    const userFriendList = await FriendList.findAll({
        attributes: ['id', 'req_to', 'status'],
        where: {
            [Op.and]: [{ userId: req.Users.id }, { status: 'Friend' }]
        },
        include: {
            model: Users,
            attributes: ['id', 'username']
        }
    });
}