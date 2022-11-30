(() => {
  const continueProcessingCSV = () => {
    console.log("continueProcessingCSV was called");
    document
      .querySelector(
        ".rc_button.rc_button--primary.process_upload.process_warning"
      )
      .click();

    // setTimeout
    setTimeout(() => {
      console.log("Clicking on the modal now.");
      const modal = document.querySelector(
        ".jconfirm.jconfirm-light.jconfirm-open"
      );
      modal.querySelectorAll(".btn.btn-default")[1].click();
    }, 1000);
  };



  setInterval(
    () => {
      console.log("running");

      const processing_cell = Array.from(
        document.querySelectorAll(
          ".rc_layout__sm.rc_flex-table__cell.rc_text--center.processing__cell"
        )
      );

      let isStillProcessing = false;
      let hasMoreToProcess = false;

      processing_cell.forEach((element) => {
        const processing_element = element.querySelector(
          ".rc_chip.rc_chip--small.rc_background--blue.rc_color--white"
        );
        if (processing_element) {
          isStillProcessing = true;
        }
      });

      processing_cell.forEach((element) => {
        const processBtn = element.querySelector(
          ".rc_button.rc_button--primary.process_upload.process_warning"
        );
        if (processBtn) {
          hasMoreToProcess = true;
        }
      });

      console.log(`processing_cell.length = ${processing_cell.length}`);

      console.log(
        `isStillProcessing ${isStillProcessing} && ${hasMoreToProcess} hasMoreToProcess`,
        !isStillProcessing && hasMoreToProcess
      );

      if (!isStillProcessing && hasMoreToProcess) {
        console.log("Calling processChange");
        continueProcessingCSV();
      }
    },

    6000
  );
})();
