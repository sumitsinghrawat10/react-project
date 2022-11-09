export const SortRows = (orderBy: string, orderType: string, props: any) => {
    if (props.rows !== null) {
        props.ascRows = [...props.rows];
        props.ascRows = props.ascRows.sort((a: any, b: any) => {
            const textA = a[orderBy].toUpperCase();

            const textB = b[orderBy].toUpperCase();
            if (textA < textB) {
                return -1;
            } else if (textA > textB) {
                return 1;
            } else {
                return 0;
            }
        });

        if (orderType === 'asc') {
            props.setRows(props.ascRows);
        } else if (orderType === 'dsc') {
            props.setRows(props.ascRows.reverse());
        } else {
            return;
        }
    }
};
