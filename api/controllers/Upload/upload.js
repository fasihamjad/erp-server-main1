const fs = require("fs");
// const baseUrl = "http://localhost:8000/files/";

exports.upload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }
        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
        });
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
            });
        }
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
};

exports.getAll = (req, res) => {
    const directoryPath = "./Uploads/";
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Unable to scan files!",
            });
        }
        let fileInfos = [];
        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: file,
            });
        });

        res.status(200).send(fileInfos);
    });
};

exports.getOne = (req, res) => {
    const fileName = req.params.Id;
    // const directoryPath = "./Uploads/";
    const directoryPath = "https://erpbe.fasreports.com/";
    const myFile = directoryPath + fileName;

    console.log({ file: myFile });
    // res.download(directoryPath + fileName, fileName, (err) => {
    //     if (err) {
    //         res.status(500).send({
    //             message: "Could not download the file. " + err,
    //         });
    //     }
    // });
    // res.download(myFile);
    res.send({ image: myFile });
};

