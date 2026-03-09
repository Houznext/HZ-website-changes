import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";

const AccessControl = ({ tables }) => {

    const [data, setData] = useState([...tables]);

    useEffect(() => {
        setData(tables);
    }, [tables]);
    
    const [isActive, setIsActive] = useState(false);

    const toggleAction = (id, action) => {
        setData(prevTables =>
            prevTables.map(table =>
                table.id === id
                    ? { ...table, [action]: !table[action] }
                    : table
            )
        );
    };

    useEffect(() => {
        const test = JSON.stringify(tables) === JSON.stringify(data);
        setIsActive(!test);
    }, [data]);

    return (
        <div className={styles.container}>
            <div className={styles.heading_con}>
                <h1 className={styles.heading}>AccessControl</h1>
                <button className={isActive ? styles.update_btn_ative : styles.update_btn_disable}>Update</button>
            </div>
            <div className={styles.header}>
                <div className={styles.title}>Tables</div>
                <div className={styles.action}>CREATE</div>
                <div className={styles.action}>UPDATE</div>
                <div className={styles.action}>DELETE</div>
                <div className={styles.action}>READ</div>
            </div>
            <div className={styles.body}>
                {data.map((item, idx) => {
                    return (
                        <div className={styles.table}>
                            <div className={styles.title}>{item?.title}</div>
                            <div className={styles.action}>
                                {item?.create ? (
                                    <span onClick={() => toggleAction(item?.id, 'create')}>
                                        <CheckIcon className={styles.icon} color="success" />
                                    </span>
                                ) : (
                                    <span onClick={() => toggleAction(item?.id, 'create')}>
                                        <DoDisturbIcon className={styles.icon} color="error" />
                                    </span>
                                )}
                            </div>
                            <div className={styles.action}>
                                {item?.update ? (
                                    <span onClick={() => toggleAction(item?.id, 'update')}>
                                        <CheckIcon className={styles.icon} color="success" />
                                    </span>
                                ) : (
                                    <span onClick={() => toggleAction(item?.id, 'update')}>
                                        <DoDisturbIcon className={styles.icon} color="error" />
                                    </span>
                                )}
                            </div>
                            <div className={styles.action}>
                                {item?.delete ? (
                                    <span onClick={() => toggleAction(item?.id, 'delete')}>
                                        <CheckIcon className={styles.icon} color="success" />
                                    </span>
                                ) : (
                                    <span onClick={() => toggleAction(item?.id, 'delete')}>
                                        <DoDisturbIcon className={styles.icon} color="error" />
                                    </span>
                                )}
                            </div>
                            <div className={styles.action}>
                                {item?.read ? (
                                    <span onClick={() => toggleAction(item?.id, 'read')}>
                                        <CheckIcon className={styles.icon} color="success" />
                                    </span>
                                ) : (
                                    <span onClick={() => toggleAction(item?.id, 'read')}>
                                        <DoDisturbIcon className={styles.icon} color="error" />
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AccessControl;
