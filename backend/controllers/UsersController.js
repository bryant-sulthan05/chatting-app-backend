import Users from "../models/Users";
import argon2, { hash } from "argon2";
import path from 'path';
import fs from 'fs';
import { Op } from "sequelize";

// all role
export const editProfile = async (req, res) => {
    const user = await Users.findOne({
        where: {
            [Op.and]: [{ id: req.params.id }, { status: 'online' }]
        }
    });
    const { username, email, password, bio, tlp } = req.body;
    let hashPassword;

    if (password === "" || password === null) { // cek jika user tidak mengubah password
        hashPassword = user.password
    } else { // jika user ingin mengubah password
        hashPassword = await argon2.hash(password) // hash password
    }

    // cek password dan konfirmasi password sama atau tidak
    if (password !== hashPassword) return res.status(400).json({ msg: 'Password dan konfirmasi password tidak sama!' });

    let profile_pict;
    let allowedType = ['.jpeg', '.jpg', '.png'];

    if (user.profile_pict.length > 0) {
        profile_pict = user.profile_pict;

        const file = req.files?.file;

        if (file) {
            const size = file.data.length;
            const ext = path.extname(file.name);
            if (!allowedType.includes(ext.toLowerCase())) {
                return res.status(422).json({ msg: "Harap menggunakan gambar dengan ekstensi '.png', '.jpe' atau '.jpeg'" });
            }

            // Ubah kondisi berdasarkan ukuran file yang benar
            if (size < 100 || size > 10000) {
                return res.status(422).json({ msg: "Gambar harus berukuran lebih dari 100Kb dan kurang dari 10Mb" });
            }

            // Generate kode unik berupa ID user dan hash nama file
            const uniqueCode = `${user.id}_${Date.now()}`;
            const hashedFileName = `${argon2.hashSync(uniqueCode)}${ext}`;

            // Simpan file di tempat yang sesuai (misalnya, folder 'uploads')
            file.mv(`./public/images/profile/${hashedFileName}`, (err) => {
                if (err) {
                    return res.status(500).json({ msg: "Gagal mengunggah gambar" });
                }
            });

            profile_pict = hashedFileName;
        }
    } else {
        profile_pict = '';
    }
}

// admin
export const getUsers = async (req, res) => {
    try {
        const response = await Users.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const addNewAdmin = async (req, res) => {
    const password = (firstname.toLowerCase()).replace(/\s/g, '') + '123';

    const hashPassword = await argon2.hash(password); // Hash password
    try {
        await Users.create({
            username: username,
            email: 'admin@example.com',
            password: hashPassword,
            tlp: '08xxxxxxxx',
            status: 'offline',
            role: 'admin'
        });
        res.status(200).json({ msg: 'Akun berhasil ditambah!' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        const response = await Users.findOne({
            attributes: ['username', 'email', 'profile_pict', 'url', 'bio', 'tlp', 'status'],
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const deleteAdmin = async (req, res) => {
    const admin = await Users.findOne({
        where: {
            [Op.and]: [{ id: req.params.id }, { role: 'admin' }]
        }
    });

    if (!admin) return res.status(404).json({ message: 'User tidak terdaftar' });

    try {
        const filePath = `./public/images/products/${product.image}`;
        fs.unlinkSync(filePath);
        await Products.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: "User berhasil dihapus" });
    } catch (error) {
        console.log(error.message);
    }
}

// User
export const regUser = async (req, res) => {
    const { username, email, password, confPassword, tlp, bio } = req.body;

    // cek apakah password dan confPassword sama
    const isPasswordValid = await argon2.verify(confPassword, password);

    // huruf yang harus ada di dalam password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    // jika password password dan confPassword tidak sama
    if (!isPasswordValid) return res.status(400).json({ msg: 'Password dan konfirmasi password tidak sama!' });

    // jika password yang dimasukkan kurang dari 8 karakter
    if (password.length < 8 && confPassword.length < 8) return res.status(400).json({ msg: 'Passwrod harus memiliki lebih dari 8 karakter' });

    // jika password tidak unik
    if (!passwordRegex.test(password)) return res.status(400).json({ msg: 'Password harus terdiri dari setidaknya 8 karakter dengan minimal satu huruf besar, satu angka, dan satu simbol (! @ # $ % ^ & *)' });

    const hashPassword = argon2.hash(password);

    // cek email dan tlp
    const cekEmail = await Users.findAll({
        where: {
            [Op.and]: [{ email: email, tlp: tlp }]
        }
    });

    if (email === cekEmail.email || tlp === cekEmail.tlp) return res.status(400).json({ msg: 'Email atau No Tlp sudah terdaftar' });

    let profile_pict;
    let size;
    let ext;
    let allowedType;
    let uniqueIdentifier;
    let fileName;
    // jika user tidak mengisi foto profile
    if (req.files === null) {
        profile_pict = username[0].toUpperCase(); // Mengambil huruf pertama dari username untuk dijadikan foto profile
        url = '';
        fileName = profile_pict;
    } else { // jika user mengupload foto profile
        profile_pict = req.files.file;
        size = profile_pict.data.length;
        ext = path.extname(file.name);
        allowedType = ['.jpeg', '.jpg', '.png']; // ekstensi file yang dapat diupload
        uniqueIdentifier = `${username + "_" + Math.floor(Math.random() * (1000 - 0 + 1)) + 0}_${Date.now()}`; // membuat kode unik berdasarkan username dan ditambah angka acak
        fileName = `${profile_pict.md5}_${uniqueIdentifier}${ext}`; // nama file yang dienkripsi

        // mendapatkan url
        url = `${req.protocol}://${req.get("host")}/images/profile/${fileName}`;

        // jika ekstensi file tidak tepat
        if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: 'Format gambar tidak tepat!' });

        // jika ukuran gambar tidak sesuai ketentuan
        if (size > 10000 || size < 100) return res.status(422).json({ msg: 'Gambar harus berukuran lebih dari 100kb dan lebih kecil dari 10Mb!' });

        // memindahkan gambar ke folder
        profile_pict.mv(`./public/images/profile/${fileName}`, async (err) => { // jika gambar tidak bisa terupload
            if (err) return res.status(500).json({ msg: err.message });
        });
    }

    try {
        await Users.create({
            username: username,
            email: email,
            password: hashPassword,
            profile_pict: fileName,
            url: url,
            bio: bio,
            tlp: tlp,
            status: 'offline',
            role: 'user'
        });
        res.status(200).json({ msg: 'Akun berhasil dibuat!' });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}

export const deleteAcc = async (req, res) => {
    const userProfile = await Users.findOne({
        where: {
            [Op.and]: [{ id: req.userId }, { status: 'online' }, { role: 'user' }]
        }
    });

    try {
        const filePath = `./public/images/profile/${userProfile.profile_pict}`;
        fs.unlinkSync(filePath);
        await Users.destroy({
            where: {
                id: req.userId
            }
        })
        res.status(200);
    } catch (error) {
        console.log(error.message);
    }
}
