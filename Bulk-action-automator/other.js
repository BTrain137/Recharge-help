(() => {
  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  function continueProcessingCSV() {
    console.log("CLICKED!!!!!!!!!!!!!!!");
    // document
    //   .querySelector(
    //     ".rc_button.rc_button--primary.process_upload.process_warning"
    //   )
    //   .click();

    // // setTimeout
    // setTimeout(() => {
    //   const modal = document.querySelector(
    //     ".jconfirm.jconfirm-light.jconfirm-open"
    //   );
    //   modal.querySelectorAll(".btn.btn-default")[1].click();
    // }, 500);
  }

  const processChange = debounce(() => continueProcessingCSV());

  const processing_cell = Array.from(
    document.querySelectorAll(
      ".rc_layout__sm.rc_flex-table__cell.rc_text--center.processing__cell"
    )
  );

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList) => {
    const arr = [];
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        // console.log(mutation);
        console.log(mutation.target);
        const target = mutation.target;
        arr.push(target.outText);
      }
    }
    console.log(arr);
    processChange(arr);
  };

  // Create an observer instance linked to the callback function

  processing_cell.forEach((element) => {
    const observer = new MutationObserver(callback);
    observer.observe(element, config);
  });
})();
