import React from "react";

export type Item = {
	name: string;
	component: React.ComponentType<{
		open: boolean;
		onCancel: () => void;
	}>;
};

interface AddMenuProps {
	items: Item[];
}

const AddMenu: React.FC<AddMenuProps> = ({ items }) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

	const Component = selectedItem ? selectedItem.component : null;

	const handleOpen = (item: Item) => {
		setIsOpen(true);
		setSelectedItem(item);
	};

	return (
		<div>
			{items.map((item, index) => (
				<button
					onClick={() => handleOpen(item)}
					className="add-menu"
					key={index}
				>
					{item.name}
				</button>
			))}
			{Component && (
				<Component open={isOpen} onCancel={() => setIsOpen(false)} />
			)}
		</div>
	);
};

export default AddMenu;
