import React from "react";

export type Item = {
	name: string;
	type: "workload" | "nfr";
	component: React.ComponentType<{
		open: boolean;
		onCancel: () => void;
		onSuccess: (value: string) => void;
		onError: (error: unknown) => void;
	}>;
};

interface AddMenuProps {
	items: Item[];
	onSelect: (type: Item["type"], value: string) => void;
}

const AddMenu: React.FC<AddMenuProps> = ({ items, onSelect }) => {
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
			{Component && selectedItem && (
				<Component
					open={isOpen}
					onCancel={() => setIsOpen(false)}
					onSuccess={(value) => {
						onSelect(selectedItem.type, value);
						setIsOpen(false);
					}}
				/>
			)}
		</div>
	);
};

export default AddMenu;
