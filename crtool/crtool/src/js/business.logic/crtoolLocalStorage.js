const crtoolLocalStorage = {

    getCurrentReview() {
        let review = false;
        const token = this.getUrlParameter('token');
        let review_id = token || localStorage.getItem('curriculumReviewId') || '';
        console.log('getCurrentReview: line 6');
        console.log(review_id);
        if (!token && review_id) {
            console.log('redirect to URL with token: line 10');
            const new_url = this.updateUrlParameter(window.location.href, 'token', review_id);
            window.history.pushState({path:new_url}, '', new_url);
        }
        review = this.loadReviewFromDatabase(review_id);
        console.log(review);
        return review;
    },

    /*
     * load review state from LocalStorage
     */
    getReviewFromLocalStorage(review_id = null) {
        let review = {};
        console.log('getReviewFromLocalStorage review: line 27');
        if (!review_id) {
            review_id = localStorage.getItem('curriculumReviewId') || "";
            console.log('review: line 30');
            console.log(review_id);
        }
        if (review_id) {
            review = localStorage.getItem('crtool.' + review_id) || "{}";
            console.log('review: line 35');
            if (review) {
                localStorage.setItem('curriculumReviewId', review_id)
                review = JSON.parse(review);
                console.log('review: line 40');
                console.log(review);
            }
        }
        return review;
    },

    /*
     * load review state from Database
     */
    loadReviewFromDatabase(review_id) {
        console.log('loadReviewFromDatabase: line 52');
        let review = this.getReviewFromLocalStorage(review_id);
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "../get-review?tdp-crt_id=" + review_id, false);
        xhttp.send();
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const db_review = JSON.parse(xhttp.responseText);
            console.log('db_review: line 59');
            console.log(db_review);
            console.log('review: line 61');
            console.log(review);
            const is_review_valid = ("last_updated" in review) && ("id" in review)
            const is_db_review_valid = ("last_updated" in db_review) && ("id" in db_review)
            if (is_review_valid && is_db_review_valid) {
                console.log('db_review.last_updated: line 66');
                console.log(db_review.last_updated);
                console.log(new Date(db_review.last_updated));
                console.log('review.last_updated: line 68');
                console.log(review.last_updated);
                console.log(new Date(review.last_updated));
            }
            if (!is_review_valid ||
                (
                    is_review_valid &&
                    is_db_review_valid &&
                    new Date(db_review.last_updated) > new Date(review.last_updated)
                )
            ) {
                console.log('crtoolLocalStorage.js: line 78');
                review = db_review;
                localStorage.setItem('crtool.' + db_review.id, JSON.stringify(db_review));
                localStorage.setItem('curriculumReviewId', db_review.id)
            }
        }
        return review;
    },

    /*
     * Overwrite Database review state with state in LocalStorage
     */
    updateDatabaseReview(review) {
        console.log('updateDatabaseReview: line 91');
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "../update-review/", false);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        console.log('review: line 95');
        console.log(review);
        xhttp.send(JSON.stringify(review));
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            review = JSON.parse(xhttp.responseText);
            console.log('review: line 100')
            console.log(review);
            if ("id" in review) {
                console.log('update localStorage: line 103');
                localStorage.setItem('crtool.' + review.id, JSON.stringify(review));
            }
        }
        return review;
    },

    setItem(key, value) {
        console.log('crtoolLocalStorage setItem: line 111');
        console.log(key + ': ' + value);
        const review = this.getCurrentReview();
        if (review) {
            console.log('setItem review: line 115');
            review[key] = value;
            return this.updateDatabaseReview(review);
        }
        return false;
    },

    getItem(key) {
        console.log('crtoolLocalStorage getItem: line 123');
        console.log(key);
        const review = this.getCurrentReview();
        if (key in review) {
            console.log('getItem: line 127');
            return review[key];
        }
        return null;
    },

    removeItem(key) {
        const review = this.getCurrentReview();
        if (key in review) {
            delete review[key];
            return true;
        }
        return false;
    },

    clear() {
        const review = this.getCurrentReview();
        if (review) {
            localStorage.removeItem('curriculumReviewId');
        }
    },

    // IE compatible method for getting a querystring parameter from a URL
    // Credit: https://stackoverflow.com/a/901144
    getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(window.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    // Add / Update a key-value pair in the URL query parameters
    // Credit: https://gist.github.com/niyazpk/f8ac616f181f6042d1e0
    updateUrlParameter(uri, key, value) {
        // remove the hash part before operating on the uri
        const i = uri.indexOf('#');
        const hash = i === -1 ? ''  : uri.substr(i);
             uri = i === -1 ? uri : uri.substr(0, i);

        const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        const separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            uri = uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            uri = uri + separator + key + "=" + value;
        }
        return uri + hash;  // finally append the hash as well
    },

};

export default crtoolLocalStorage;