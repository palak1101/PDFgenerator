const fastify = require("fastify")({ logger: true });
const wkhtmltopdf = require("wkhtmltopdf");
const fs = require("fs");
const cors = require("@fastify/cors");

const { sequelize, pdfdata } = require("./models");

fastify.register(cors, {});

const addCssFile = (html) => {
  let cssContent = fs.readFileSync("./quill.core.css", "utf-8");
  cssContent = "<style>" + cssContent + "</style>";
  return cssContent + `<div class="ql-editor">` + html + "</div>";
};

// test route
fastify.get("/", async (req, res) => {
  try {
    return res.send({ success: true, msg: "homepage" });
  } catch (error) {
    return res.send({ success: false, msg: error });
  }
});

//save new template
fastify.post("/saveTemplate", async (req, res) => {
  const { title, htmlCode } = req.body;

  try {
    const templateData = await pdfdata.create({ title, htmlCode });
    const template_id = templateData.dataValues.template_id;
    console.log(template_id);

    return res.send({
      success: true,
      msg: "template saved successfully!",
      data: { template_id },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, msg: error || "something went wrong" });
  }
});

//get template by template_id
fastify.post("/generatePdf", async (req, res) => {
  const { template_id } = req.body;
  //   console.log(template_id);

  try {
    const templateData = await pdfdata.findOne({
      where: { template_id },
    });
    if (templateData === null) {
      return res.status(404).send({
        success: false,
        msg: "template not found!",
      });
    }

    const htmlString = templateData.htmlCode;
    const newCode = addCssFile(htmlString);

    const options = {
      output: "output.pdf", // output file name
      pageSize: "a4", // PDF page size
    };

    await wkhtmltopdf(newCode, { output: "output.pdf" }, (err, stream) => {
      if (err) {
        console.log(err);
      }
    });

    res.header("Content-Type", "application/pdf");
    const mStream = fs.createReadStream("output.pdf");
    return res.send(mStream);

    // const stream = fs.createReadStream("output.pdf");

    // return res.send({ success: true, data: result });

    // wkhtmltopdf(htmlString, options, (err, stream) => {
    //   if (err) {
    //     console.error("Error:", err);
    //   } else {
    //     // Write the PDF stream to a file
    //     stream.pipe(fs.createWriteStream(options.output));
    //     console.log("PDF generated successfully!");
    //   }
    // });

    // return res.send({
    //   success: true,
    //   msg: "template found",
    //   data: templateData,
    // });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: error,
    });
  }
});

const PORT = 5000;

const start = async () => {
  try {
    await fastify.listen(PORT);
    console.log(`Server running at port ${PORT}`);
    await sequelize.sync({ alter: true });
    console.log("Database Synced!");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
