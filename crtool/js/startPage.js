
/**
 * The below code manages the enabling/disabling of the submit button
 * Also manages the saving and setting of the Title, Date, & Grade Range
 */

var newReviewModalWindow = document.getElementById('modal-start-over');
var saveWorkModalWindow = document.getElementById('modal-save-work');
var gradeRange = document.getElementById('tdp-crt_grade');

// Call to get things initialized
setInitialFormValues();

/*
 * Set the values based on localStorage
 */
function setInitialFormValues() {
    var review = getCurrentReview();
    if (review) {
        document.getElementById('tdp-crt_title').value = review.curriculumTitle || "";
        document.getElementById('tdp-crt_pubdate').value = review.publicationDate || "";
        document.getElementById('tdp-crt_grade').value = review.gradeRange || "";
        document.getElementById('tdp-crt_id').value = review.id || "";
        document.getElementById('tdp-crt_pass_code').value = review.pass_code || "";
    }

    setBeginReviewButtonEnabling();

    //Escape closes both modal dialogs
    document.onkeydown = function(evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27) {
            closeSaveWorkModalWindow();
            closeNewReviewModalWindow();
        }
    };
}

/*
 * Add this function to any required field so we can monitor changed values
 */
function onValuesChanged(value) {
    setBeginReviewButtonEnabling();
}

/*
 * Method to manage enabling or dissabling begin button based on form values
 */
function setBeginReviewButtonEnabling() {
    var selectedGradeValue = gradeRange.value;

    //check required fields have values
    var isValidGradeSelected = selectedGradeValue === "Elementary school" ||
                               selectedGradeValue === "Middle school" ||
                               selectedGradeValue === "High school";
    var isEnabled = isValidGradeSelected && document.getElementById('tdp-crt_title').value;

    document.getElementById('tdp-crt-begin-review-btn').disabled = !isEnabled;
}

/*
 * Method that actually saves values (Title, Date, & Grad Range)
 */
function beginReviewButtonClick(e) {
    e.preventDefault();
    var curriculumTitle = document.getElementById('tdp-crt_title').value;
    var publicationDate = document.getElementById('tdp-crt_pubdate').value;
    var gradeRange = document.getElementById('tdp-crt_grade').value;
    var curriculumReviewId = document.getElementById('tdp-crt_id').value;
    var curriculumPassCode = document.getElementById('tdp-crt_pass_code').value;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const review = JSON.parse(this.responseText);
            localStorage.setItem('curriculumReviewId', review.id);
            localStorage.setItem('crtool.'+review.id, JSON.stringify(review));
            window.location.href = '../tool?token='+ review.id;
        }
    };
    var requestUrl = '../create-review?tdp-crt_title=' +
            curriculumTitle +
            '&tdp-crt_pubdate=' + publicationDate +
            '&tdp-crt_grade=' + gradeRange +
            '&tdp-crt_pass_code=' + curriculumPassCode;
    if (curriculumReviewId) {
        requestUrl = '../get-review?tdp-crt_id=' + curriculumReviewId;
    }
    xhttp.open("GET", requestUrl);
    xhttp.send();

    recordAnalyticsForPage(curriculumTitle, publicationDate, gradeRange);
}

/*
 * When user starts a new review we need to send analytics for
 * Curriculum Title, Publication Date, & Grade Range
 */
function recordAnalyticsForPage(curriculumTitle, publicationDate, gradeRange) {
    var category="curriculum review tool interaction";
    // Analytics curriculum title
    sendAnalytics("curriculum title", curriculumTitle.trim(), category);

    // Analytics date of publication
    publicationDate = publicationDate ? publicationDate.trim() : "unspecified";
    sendAnalytics("date of publication", publicationDate, category);

    // Analytics grade range
    sendAnalytics("grade range", gradeRange, category);
}

/*
 * User has choosen to clear all values and start over
 */
function clearLocalStorage() {
    var review = getCurrentReview();
    if (review) {
        localStorage.removeItem('curriculumReviewId');
    }

    document.getElementById('tdp-crt_title').value = "";
    document.getElementById('tdp-crt_pubdate').value = "";
    document.getElementById('tdp-crt_grade').value = "";

    closeNewReviewModalWindow();
    setBeginReviewButtonEnabling();
}

/*
 * Open New Review Warning Modal Dialog
 */
var openingNewReviewModal = false;
function openNewReviewModalWindow() {
    //Allow screen readers to see dialog
    document.getElementById("modal-start-over").setAttribute("aria-hidden", "false");

    openingNewReviewModal = true;
    newReviewModalWindow.className += ' o-modal__visible';
    newReviewModalWindow.focus();
    document.addEventListener('click', newReviewOutsideClickListener);

    // Analytics Send start over with new review modal opened
    sendAnalytics("link clicked: Start over with a new review", "Starting over");
}

/*
 * Close New Review Warning Modal Dialog
 */
function closeNewReviewModalWindow() {
    //Hide from screen readers
    document.getElementById("modal-start-over").setAttribute("aria-hidden", "false");
    removeClassFromElement(newReviewModalWindow, 'o-modal__visible');
    document.removeEventListener('click', newReviewOutsideClickListener);
}

/*
 * Open Save Work Warning Modal Dialog
 */
var openingSaveWorkModal = false;
function openSaveWorkModalWindow() {
    //Allow screen readers to see dialog
    document.getElementById("modal-save-work").setAttribute("aria-hidden", "false");

    openingSaveWorkModal = true;
    saveWorkModalWindow.className += ' o-modal__visible';
    saveWorkModalWindow.focus();
    document.addEventListener('click', saveWorkOutsideClickListener);
}

/*
 * Close Save Work Warning Modal Dialog
 */
function closeSaveWorkModalWindow() {
    //Hide from screen readers
    document.getElementById("modal-save-work").setAttribute("aria-hidden", "true");
    removeClassFromElement(saveWorkModalWindow, 'o-modal__visible');
    document.removeEventListener('click', saveWorkOutsideClickListener);
}

/*
 * Some versions of IE do not support standard functionality when it
 * comes to removing classnames.  So we need to split remove then join
 */
function removeClassFromElement(element, classNameToRemove) {
    var classes = element.className.split(' ')
    var idx = classes.indexOf(classNameToRemove)
    if (idx !== -1) classes.splice(idx,1)
    element.className = classes.join(' ')
}

/*
 * Method to close New Review daialog if click outside
 */
function newReviewOutsideClickListener(event) {
    var startOverModal = document.querySelector("#modal-start-over .o-modal_content");
    if (!openingNewReviewModal && !startOverModal.contains(event.target)) {
      closeNewReviewModalWindow();
    }

    // Since it wants to close on open we need a use this flag on first trigger
    if (openingNewReviewModal) {
      openingNewReviewModal = false;
    }
}

/*
 * Method to close Save Work daialog if click outside
 */
function saveWorkOutsideClickListener(event) {
    var startOverModal = document.querySelector("#modal-save-work .o-modal_content");
    if (!openingSaveWorkModal && !startOverModal.contains(event.target)) {
      closeSaveWorkModalWindow();
    }

    // Since it wants to close on open we need a use this flag on first trigger
    if (openingSaveWorkModal) {
      openingSaveWorkModal = false;
    }
}

/*
 *
 */
function getCurrentReview() {
    review = false;
    var reviewId = localStorage.getItem('curriculumReviewId') || "";
    if (reviewId) {
        if (review = localStorage.getItem('crtool.' + reviewId)) {
            review = JSON.parse(review);
        }
    }
    return review;
}