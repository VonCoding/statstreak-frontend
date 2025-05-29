
export default async function handler(req, res) {
  const { slug, book } = req.query;

  const mockOdds = [
    {
      name: 'Anthony Edwards',
      slug: 'anthony-edwards',
      stat: 'Points',
      line: 25.5,
      book
    },
    {
      name: 'Karl-Anthony Towns',
      slug: 'karl-anthony-towns',
      stat: 'Rebounds',
      line: 10.5,
      book
    },
    {
      name: 'Shai Gilgeous-Alexander',
      slug: 'shai-gilgeous-alexander',
      stat: 'Points',
      line: 28.0,
      book
    },
    {
      name: 'Chet Holmgren',
      slug: 'chet-holmgren',
      stat: 'Blocks',
      line: 2.5,
      book
    }
  ];

  res.status(200).json({ odds: mockOdds });
}
