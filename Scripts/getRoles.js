import fetch from 'node-fetch';

const get = async () => {
  try {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        query RolesInfo {
          rolesInfo {
            ts
          }
        }
        `,
        variables: {},
      }),
    });

    const body = await res.json();
    console.log(body.data.rolesInfo.ts);
  } catch (error) {
    console.error(error);
  }
};

get();
