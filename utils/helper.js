import * as CryptoJS from 'crypto-js';

export const asyncLocalStorage = {
    async setItem(key, value) {
        return Promise.resolve().then(function () {
            localStorage.setItem(key, encrypt(value));
        });
    },
    async getItem(key) {
        return Promise.resolve().then(function () {
            let data = localStorage.getItem(key) || "";
            return decrypt(data) || null;
        });
    },
    async removeItem(key) {
        return Promise.resolve().then(function () {
            return localStorage.removeItem(key);
        });
    }
};

function encrypt(txt) {
    return CryptoJS.AES.encrypt(txt, process.env.REACT_APP_SECRET_KEY).toString();
}

function decrypt(txtToDecrypt) {
    return CryptoJS.AES.decrypt(txtToDecrypt, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8);
}



export function initials(name) {
    if (!name) return ""
    return name.split(" ").map((n) => `${n[0]}`.toUpperCase()).join("");
}

export function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
export function ucFirstWord(string) {
    return string.replaceAll("_", " ").split(" ").map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
}

export function randomStr(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function nl2br(str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}