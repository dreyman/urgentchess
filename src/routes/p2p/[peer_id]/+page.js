/** @type {import('./$types').PageLoad} */
export function load({ params }) {	
	return { peer_id: params.peer_id}
}
