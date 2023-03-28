const fastify = require('fastify')({ logger: true })
const wkhtmltopdf = require('wkhtmltopdf');
const fs = require('fs');

const { sequelize, pdfdata } = require('./models');


// //get homepage
fastify.get('/api/homepage', async (req, res) => {
    try {
        return res.send('homepage')
    } catch (error) {
        return res.send(error)
    }
})

//Post a task-
fastify.post('/api/pdf', async (req, res) => {

    const { tmp_id, title, htmlstring } = req.body

    try {
        const pdf = await pdfdata.create({ tmp_id, title, htmlstring })
        // console.log(pdfdata);
        return res.send('pdf added')
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})


//get template by tmp_id-
fastify.get('/api/pdf/:tmp_id', async (req, res) => {

    const {tmp_id}  = req.params

    try {
        // console.log(pdfdata)
        const pdf = await pdfdata.findOne(
            {
                where: { tmp_id }
            }
        )
        res.send(pdf)
        const htmlString = pdf.dataValues.htmlstring;
        
        const options = {
            output: 'output.pdf', // output file name
            pageSize: 'letter' // PDF page size
        };

        wkhtmltopdf(htmlString, options, (err, stream) => {
            if (err) {
                console.error('Error:', err);
            } else {
                // Write the PDF stream to a file
                stream.pipe(fs.createWriteStream(options.output));
                console.log('PDF generated successfully!');
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})



const PORT = 5000

const start = async () => {
    try {
        await fastify.listen(PORT)
        console.log(`Server running at port ${PORT}`)
        await sequelize.sync({ alter: true})
        console.log('Database Synced!');
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
        
    }
}

start()