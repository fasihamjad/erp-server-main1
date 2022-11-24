const { sequelize } = require("../../config/database")

exports.create = async (req, res) => {
    try {

        const { user_id, session_id } = req.user;
        // console.log("user_id", user_id);
        var dataResponse = await sequelize.query(`select col_menu_id ,col_menu_name,col_menu_type_id,col_menu_level,col_runtime_name,col_sequence,col_parent_menu_id,col_parent_menu_name,col_toggle,col_anchor from func_get_user_menu(${user_id},${session_id})`)
        var list = dataResponse[0];
        var map = {}, node, roots = [], i;
        for (i = 0; i < list.length; i++) {
            map[list[i].col_menu_id] = i; // initialize the map
            list[i].children = []; // initialize the children
        }
        for (i = 0; i < list.length; i++) {
            node = list[i];
            if (node.col_parent_menu_id !== null) {
                // if you have dangling branches check that map[node.parentId] exists
                if (list[map[node.col_parent_menu_id]]) list[map[node.col_parent_menu_id]].children.push(node);
            } else {
                roots.push(node);
            }
        }
        let newRoot = [];
        list.map(m => {
            if (m.col_runtime_name) newRoot.push(m.col_runtime_name)
        })
        // console.log("newRoot", newRoot.length);
        return res.status(200).json(roots)
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}